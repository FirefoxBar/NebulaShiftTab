import { StorageKey, searchEngines } from '@/share/constant';
import { prefs } from '@/share/prefs';
import { isSameSearchContent } from '@/share/search';
import { SearchItemAlias } from '@/share/type-alias';
import { isSearchItem, type SearchDefaultItem } from '@/share/types';

/** 迁移版本，后续如有新的迁移逻辑可递增 */
const MIGRATION_VERSION = 1;
const MIGRATION_VERSION_SEARCHES = 1;

const storage = chrome.storage.local;

/**
 * 将历史数据中与内置引擎完全一致的 SearchItem 迁移为 SearchDefaultItem，
 * 使其后续可以跟随扩展版本自动更新
 */
async function migrateSearches(version: number) {
  if (version >= MIGRATION_VERSION_SEARCHES) {
    return;
  }

  const searches = prefs.get('searches');
  let changed = false;
  const newSearches = searches.map(item => {
    if (!isSearchItem(item)) {
      return item;
    }
    const engine = searchEngines.find(x => isSameSearchContent(item, x));
    if (!engine) {
      return item;
    }
    changed = true;
    const search: SearchDefaultItem = {
      [SearchItemAlias.key]: item[SearchItemAlias.key],
      [SearchItemAlias.name]: engine[SearchItemAlias.name],
      [SearchItemAlias.showOn]: item[SearchItemAlias.showOn],
      [SearchItemAlias.defaultKey]: engine[SearchItemAlias.key],
    };
    return search;
  });

  if (changed) {
    prefs.set('searches', newSearches);
    // prefs 的保存是防抖的，迁移完成后立即写入，避免后台被回收导致丢失
    await prefs.forceSave();
  }
}

async function migrate() {
  const stored = await storage.get(StorageKey.migration);
  const version =
    StorageKey.migration in stored
      ? (stored[StorageKey.migration] as number)
      : 0;

  await migrateSearches(version);

  await storage.set({
    [StorageKey.migration]: MIGRATION_VERSION,
  });
}

export function initMigration() {
  prefs.ready(() => {
    migrate().catch(e => {
      console.error('Failed to migrate:', e);
    });
  });
}
