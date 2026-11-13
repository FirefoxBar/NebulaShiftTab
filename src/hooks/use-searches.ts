import { nanoid } from 'nanoid';
import { useCallback, useMemo } from 'react';
import { EMPTY_ARR, searchEngines } from '@/share/constant';
import {
  createDefaultSearch,
  isSameSearchContent,
  resolveSearch,
  resolveSearches,
} from '@/share/search';
import { SearchItemAlias } from '@/share/type-alias';
import {
  isSearchDefaultItem,
  type SearchDefaultItem,
  type SearchItem,
} from '@/share/types';
import usePref from './use-pref';

/**
 * 搜索引擎读写逻辑
 *
 * 存储中的列表可能包含 SearchDefaultItem（引用内置引擎，随版本更新）
 * 和 SearchItem（用户自定义）。`searches` 是补全后的列表，供渲染/执行搜索使用；
 * `items` 是原始列表，供编辑、排序等需要保留引用关系的地方使用。
 */
export const useSearches = () => {
  const [items, setItems] = usePref('searches', {
    defaultValue: EMPTY_ARR,
  });

  /** 补全了内置搜索引擎字段后的列表 */
  const searches = useMemo(() => resolveSearches(items), [items]);

  /** 获取编辑所需的数据，defaultKey 用于保存时判断能否继续使用 SearchDefaultItem */
  const getSearchForEdit = useCallback(
    (key: string) => {
      const item = items.find(x => x[SearchItemAlias.key] === key);
      if (!item) {
        return undefined;
      }
      const search = resolveSearch(item);
      if (!search) {
        return undefined;
      }
      return {
        search,
        defaultKey: isSearchDefaultItem(item)
          ? item[SearchItemAlias.defaultKey]
          : undefined,
      };
    },
    [items],
  );

  /**
   * 保存搜索引擎
   * 若内容与内置引擎一致，则保存为 SearchDefaultItem，否则保存为 SearchItem
   */
  const saveSearch = useCallback(
    (search: SearchItem, defaultKey?: string) => {
      const key = search[SearchItemAlias.key] || nanoid();
      const value: SearchItem = {
        ...search,
        [SearchItemAlias.key]: key,
      };

      const engine = defaultKey
        ? searchEngines.find(x => x[SearchItemAlias.key] === defaultKey)
        : undefined;

      let next: SearchItem | SearchDefaultItem = value;
      if (engine && isSameSearchContent(value, engine)) {
        next = createDefaultSearch(engine, key, value[SearchItemAlias.showOn]);
      }

      const index = items.findIndex(x => x[SearchItemAlias.key] === key);
      const newItems = [...items];
      if (index === -1) {
        newItems.push(next);
      } else {
        newItems[index] = next;
      }
      setItems(newItems);
    },
    [items, setItems],
  );

  /** 从内置搜索引擎快速添加一项 */
  const addDefaultSearch = useCallback(
    (engine: SearchItem) => {
      setItems([...items, createDefaultSearch(engine, nanoid())]);
    },
    [items, setItems],
  );

  const deleteSearch = useCallback(
    (key: string) => {
      setItems(items.filter(x => x[SearchItemAlias.key] !== key));
    },
    [items, setItems],
  );

  /** 移动某一项，供拖拽排序使用 */
  const moveSearch = useCallback(
    (from: number, to: number) => {
      if (from === to || from < 0 || to < 0) {
        return;
      }
      const newItems = [...items];
      const [moved] = newItems.splice(from, 1);
      newItems.splice(to, 0, moved);
      setItems(newItems);
    },
    [items, setItems],
  );

  return {
    /** 原始存储列表 */
    items,
    /** 补全后的列表 */
    searches,
    getSearchForEdit,
    saveSearch,
    addDefaultSearch,
    deleteSearch,
    moveSearch,
  };
};
