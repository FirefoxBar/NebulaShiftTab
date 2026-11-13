import { searchEngines } from './constant/search';
import { prefs } from './prefs';
import { SearchItemAlias } from './type-alias';
import {
  isSearchDefaultItem,
  isSearchItem,
  type SearchDefaultItem,
  type SearchItem,
} from './types';

/** 参与“是否仍与内置引擎一致”比较的字段（showOn 属于用户配置，不参与比较） */
const SEARCH_CONTENT_KEYS = [
  SearchItemAlias.name,
  SearchItemAlias.url,
  SearchItemAlias.suggestion,
  SearchItemAlias.suggestionType,
  SearchItemAlias.extractSuggestion,
] as const;

const normalizeSearchValue = (value?: string) => value || undefined;

/** 用内置搜索引擎的数据补全 SearchDefaultItem */
export const resolveSearch = (
  item: SearchItem | SearchDefaultItem,
): SearchItem | undefined => {
  if (isSearchDefaultItem(item)) {
    const engine = searchEngines.find(
      x => x[SearchItemAlias.key] === item[SearchItemAlias.defaultKey],
    );
    if (!engine) {
      return undefined;
    }
    // 名称、url、suggestion 等始终以内置配置为准，用户的 key/showOn 保持不变
    return {
      ...engine,
      [SearchItemAlias.key]: item[SearchItemAlias.key],
      [SearchItemAlias.showOn]: item[SearchItemAlias.showOn],
    };
  }
  if (isSearchItem(item)) {
    return item;
  }
  return undefined;
};

export const resolveSearches = (
  items: Array<SearchItem | SearchDefaultItem>,
): SearchItem[] =>
  items.map(resolveSearch).filter((x): x is SearchItem => Boolean(x));

export const getSearches = () => resolveSearches(prefs.get('searches'));

/** 判断search内容是否与内置搜索引擎一致 */
export const isSameSearchContent = (a: SearchItem, b: SearchItem) =>
  SEARCH_CONTENT_KEYS.every(
    key => normalizeSearchValue(a[key]) === normalizeSearchValue(b[key]),
  );

/** 基于内置搜索引擎创建 SearchDefaultItem */
export const createDefaultSearch = (
  engine: SearchItem,
  key: string,
  showOn = engine[SearchItemAlias.showOn],
): SearchDefaultItem => ({
  [SearchItemAlias.key]: key,
  [SearchItemAlias.name]: engine[SearchItemAlias.name],
  [SearchItemAlias.showOn]: showOn,
  [SearchItemAlias.defaultKey]: engine[SearchItemAlias.key],
});
