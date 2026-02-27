import { DefaultBackgroundEngines, StorageKey } from '@/share/constant';
import { prefs } from '@/share/prefs';
import type { BackgroundItem, PrefValue } from '@/share/types';
import { createJsonAta, extractData } from '@/share/utils';

const storage = chrome.storage.local;

interface LastUpdate {
  time: number;
  type: PrefValue['background']['type'];
  key: string;
}

async function handleBackgroundItem(item: BackgroundItem) {
  // 获取上次更新时间
  const storedData = (await storage.get([
    StorageKey.bg,
    StorageKey.bgLastUpdate,
  ])) as {
    [key: string]: any;
  };

  const lastUpdate: LastUpdate | undefined =
    storedData[StorageKey.bgLastUpdate];

  // 判断是否需要更新
  let shouldUpdate = false;

  if (!lastUpdate) {
    shouldUpdate = true;
  } else {
    if (lastUpdate.type !== item.type) {
      shouldUpdate = true;
    }

    if (lastUpdate.type === 'builtin' && item.key !== lastUpdate.key) {
      shouldUpdate = true;
    }

    const lastUpdateTime = new Date(lastUpdate.time);

    if (item.refresh === 0) {
      shouldUpdate = false;
    }

    if (!shouldUpdate && item.refresh === 'new-day') {
      // 如果设置了new-day，比较日期是否是同一天
      const now = new Date();
      shouldUpdate =
        lastUpdateTime.getDate() !== now.getDate() ||
        lastUpdateTime.getMonth() !== now.getMonth() ||
        lastUpdateTime.getFullYear() !== now.getFullYear();
    }

    if (!shouldUpdate && typeof item.refresh === 'number') {
      // 如果设置了时间间隔（秒），比较当前时间和上次更新时间
      const now = Date.now();
      const elapsedSeconds = Math.floor(
        (now - lastUpdateTime.getTime()) / 1000,
      );
      shouldUpdate = elapsedSeconds >= item.refresh;
    }
  }

  if (!shouldUpdate) {
    console.log('skip update');
    return;
  }
  console.log('start update');

  try {
    let imageUrl = item.url;

    if (item.type === 'custom' && item.custom) {
      imageUrl = await item.custom();
    }

    // 如果是API类型，需要先解析获取图片URL
    if (item.type === 'api' && item.extract) {
      const response = await fetch(item.url);
      if (!response.ok) {
        console.error(`Failed to fetch API: ${item.url}`);
        return;
      }

      const data = await response.json();

      // 使用jsonata提取图片URL
      const expr = await createJsonAta(item.extract);
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
      type: item.type,
      key: item.key,
    } as LastUpdate;
    await storage.set(updateData);

    // 设置定时任务，以便稍后重新获取
    // 计算下次检查时间
    let delayInMinutes = 5; // 默认5分钟

    if (item.refresh === 0) {
      return;
    }

    if (item.refresh === 'new-day') {
      // 如果是新一天模式，计算到明天的分钟数
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 设置为午夜

      const diffMs = tomorrow.getTime() - now.getTime();
      delayInMinutes = Math.ceil(diffMs / (1000 * 60)); // 转换为分钟
    } else if (typeof item.refresh === 'number') {
      delayInMinutes = item.refresh;
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
const runBackgroundTask = async (item: BackgroundItem) => {
  if (isUpdating) {
    return;
  }
  isUpdating = true;
  try {
    await handleBackgroundItem(item);
  } catch (_e) {
    // ignore
  }
  isUpdating = false;
};

function checkBg() {
  const setting = prefs.get('background');
  if (setting.type === 'image') {
    return;
  }
  if (setting.type === 'custom' && setting.value) {
    runBackgroundTask(setting.value);
  }
  if (setting.type === 'builtin') {
    const v = DefaultBackgroundEngines.find(x => x.key === setting.key);
    v && runBackgroundTask(v);
  }
}

export function initBg() {
  prefs.ready(() => checkBg());
  prefs.watchKey('background', () => checkBg());

  // 监听定时任务
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === 'background_refresh') {
      checkBg();
    }
  });
}
