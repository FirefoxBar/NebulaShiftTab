import {
  BackgroundItemAlias,
  SearchItemAlias,
  SiteItemAlias,
} from './type-alias';

export interface SiteItem {
  [SiteItemAlias.id]: string;
  [SiteItemAlias.name]: string;
  [SiteItemAlias.url]: string;
  [SiteItemAlias.iconType]: 'builtin' | 'auto' | 'local' | 'custom';
  [SiteItemAlias.icon]?: string;
  [SiteItemAlias.backgroundColor]?: string;
  [SiteItemAlias.padding]?: 'a' | string;
}

export interface SiteDirItem {
  [SiteItemAlias.id]: string;
  [SiteItemAlias.name]: string;
  [SiteItemAlias.children]: Array<SiteItem>;
}

export type SiteNode = SiteItem | SiteDirItem;

export const isSiteItem = (item: any): item is SiteItem =>
  typeof item === 'object' && item[SiteItemAlias.url] !== undefined;
export const isSiteDirItem = (item: any): item is SiteDirItem =>
  typeof item === 'object' && Array.isArray(item[SiteItemAlias.children]);

export interface SiteGridConfig {
  cols: number;
  /** 一维数组，索引 = 行 * cols + 列；值为站点/文件夹 id，null 表示空白区块 */
  cells: Array<string | null>;
}

export interface PrefValue {
  darkMode: 'auto' | 'on' | 'off';
  theme: 'default' | 'liquid-glass' | 'pure' | 'pixel' | 'delta-icons';
  iconProvider:
    | 'google'
    | 'duckduckgo'
    | 'icon.horse'
    | 'favicon.im'
    | 'toolb'
    | 'favicon.run'
    | 'builtin';
  timeFormat: string;
  dateFormat: string;
  siteSize: number;
  siteWidth: number;
  siteGap: number;
  showSiteName: boolean;
  siteMode: 'grid' | 'flex';
  siteGrid: SiteGridConfig;
  recordHistory: number;
  background: {
    dark: number;
    dark2: number;
    blur: number;
    type: 'image' | 'builtin' | 'custom';
    key?: string;
    value?: BackgroundItem;
  };
  customCSS: string;
  sites: Array<SiteNode>;
  searches: Array<SearchItem | SearchDefaultItem>;
  contextMenu: boolean;
}
export interface BaseSearchItem {
  [SearchItemAlias.key]: string;
  [SearchItemAlias.name]: string;
  [SearchItemAlias.showOn]: number;
}

export interface SearchDefaultItem extends BaseSearchItem {
  [SearchItemAlias.defaultKey]: string;
}

export interface SearchItem extends BaseSearchItem {
  [SearchItemAlias.url]: string;
  [SearchItemAlias.suggestion]?: string;
  [SearchItemAlias.suggestionType]?: 'json' | 'jsonp';
  [SearchItemAlias.extractSuggestion]?: string;
}

export const isSearchDefaultItem = (item: any): item is SearchDefaultItem =>
  typeof item === 'object' &&
  item[SearchItemAlias.defaultKey] !== undefined &&
  item[SearchItemAlias.showOn] !== undefined;
export const isSearchItem = (item: any): item is SearchItem =>
  typeof item === 'object' &&
  item[SearchItemAlias.url] !== undefined &&
  item[SearchItemAlias.showOn] !== undefined;

export interface BackgroundItem {
  [BackgroundItemAlias.key]: string;
  [BackgroundItemAlias.name]?: string;
  [BackgroundItemAlias.url]: string;
  [BackgroundItemAlias.type]: 'api' | 'image' | 'custom';
  // 单位：分钟
  [BackgroundItemAlias.refresh]: number | 'new-day';
  [BackgroundItemAlias.extract]: string;
}
