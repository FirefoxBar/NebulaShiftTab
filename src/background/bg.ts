import { backgroundEngines, StorageKey } from '@/share/constant';
import { prefs } from '@/share/prefs';
import { BackgroundItemAlias } from '@/share/type-alias';
import type { BackgroundItem, PrefValue } from '@/share/types';
import { createJsonAta, extractData } from '@/share/utils';

const storage = chrome.storage.local;

interface LastUpdate {
  time: number;
  type: PrefValue['background']['type'];
  key: string;
}

async function shouldUpdate(item: BackgroundItem) {
  // 获取上次更新时间
  const storedData = (await storage.get([
    StorageKey.bg,
    StorageKey.bgLastUpdate,
  ])) as {
    [key: string]: any;
  };

  const lastUpdate: LastUpdate | undefined =
    storedData[StorageKey.bgLastUpdate];

  if (!lastUpdate) {
    return true;
  }

  if (lastUpdate.type !== item[BackgroundItemAlias.type]) {
    return true;
  }

  if (item[BackgroundItemAlias.key] !== lastUpdate.key) {
    return true;
  }

  const lastUpdateTime = new Date(lastUpdate.time);

  if (item[BackgroundItemAlias.refresh] === 0) {
    return false;
  }

  if (item[BackgroundItemAlias.refresh] === 'new-day') {
    // 如果设置了new-day，比较日期是否是同一天
    const now = new Date();
    return (
      lastUpdateTime.getDate() !== now.getDate() ||
      lastUpdateTime.getMonth() !== now.getMonth() ||
      lastUpdateTime.getFullYear() !== now.getFullYear()
    );
  }

  if (typeof item[BackgroundItemAlias.refresh] === 'number') {
    // 如果设置了时间间隔（秒），比较当前时间和上次更新时间
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdateTime.getTime()) / 1000);
    return elapsedSeconds >= (item[BackgroundItemAlias.refresh] as number);
  }

  return false;
}

async function handleBackgroundItem(
  item: BackgroundItem,
  forceRefresh = false,
) {
  // 判断是否需要更新
  const bShouldUpdate = forceRefresh || (await shouldUpdate(item));

  if (!bShouldUpdate) {
    console.log('skip update');
    return;
  }
  console.log('start update');

  try {
    let imageUrl = item[BackgroundItemAlias.url];

    // 如果是API类型，需要先解析获取图片URL
    if (
      item[BackgroundItemAlias.type] === 'api' &&
      item[BackgroundItemAlias.extract]
    ) {
      const response = await fetch(item[BackgroundItemAlias.url]);
      if (!response.ok) {
        console.error(`Failed to fetch API: ${item[BackgroundItemAlias.url]}`);
        return;
      }

      const data = await response.json();

      // 使用jsonata提取图片URL
      const expr = await createJsonAta(item[BackgroundItemAlias.extract]);
      const extractedUrl = await extractData<string>(expr, data);

      if (typeof extractedUrl !== 'string' || !extractedUrl) {
        console.error('Failed to extract image URL from API response');
        return;
      }

      imageUrl = extractedUrl;
    }

    console.log('imageUrl', imageUrl);

    // 下载图片并转换为base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageUrl}`);
      return;
    }

    const blob = await imageResponse.blob();
    const reader = new FileReader();

    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () =>
        reject(new Error('Failed to read image as base64'));
      reader.readAsDataURL(blob);
    });

    const base64Image = await base64Promise;

    // 存储到storage
    const updateData: { [key: string]: any } = {};
    updateData[StorageKey.bg] = base64Image;
    updateData[StorageKey.bgLastUpdate] = {
      time: Date.now(),
      type: item[BackgroundItemAlias.type],
      key: item[BackgroundItemAlias.key],
    } as LastUpdate;
    await storage.set(updateData);

    // 设置定时任务，以便稍后重新获取
    // 计算下次检查时间
    let delayInMinutes = 5; // 默认5分钟

    if (item[BackgroundItemAlias.refresh] === 0) {
      return;
    }

    if (item[BackgroundItemAlias.refresh] === 'new-day') {
      // 如果是新一天模式，计算到明天的分钟数
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 设置为午夜

      const diffMs = tomorrow.getTime() - now.getTime();
      delayInMinutes = Math.ceil(diffMs / (1000 * 60)); // 转换为分钟
    } else if (typeof item[BackgroundItemAlias.refresh] === 'number') {
      delayInMinutes = item[BackgroundItemAlias.refresh] as number;
    }

    console.log('next update after:', delayInMinutes);
    // 创建或更新定时任务
    await chrome.alarms.clear('background_refresh');
    await chrome.alarms.create('background_refresh', {
      delayInMinutes,
    });
  } catch (error) {
    console.error('Error handling background item:', error);
  }
}

let isUpdating = false;
const runBackgroundTask = async (
  item: BackgroundItem,
  forceRefresh = false,
) => {
  if (isUpdating && !forceRefresh) {
    return;
  }
  isUpdating = true;
  try {
    await handleBackgroundItem(item, forceRefresh);
  } catch (_e) {
    // ignore
  }
  isUpdating = false;
};

export function checkBg(forceRefresh = false) {
  const setting = prefs.get('background');
  if (setting.type === 'image') {
    return;
  }
  if (setting.type === 'custom' && setting.value) {
    return runBackgroundTask(setting.value, forceRefresh);
  }
  if (setting.type === 'builtin') {
    const v = backgroundEngines.find(
      x => x[BackgroundItemAlias.key] === setting.key,
    );
    return v ? runBackgroundTask(v, forceRefresh) : undefined;
  }
}

export function initBg() {
  prefs.getAndWatch('background', () => checkBg());

  // 监听定时任务
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'background_refresh') {
      checkBg();
    }
  });
}
