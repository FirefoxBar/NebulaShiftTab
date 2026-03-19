import {
  BackgroundItemAlias,
  SearchItemAlias,
  SiteItemAlias,
} from './type-alias';

export interface PrefValue {
  darkMode: 'auto' | 'on' | 'off';
  theme: 'default' | 'liquid-glass' | 'mbe-style' | 'delta-icons';
  iconProvider:
    | 'google'
    | 'duckduckgo'
    | 'icon.horse'
    | 'favicon.im'
    | 'toolb'
    | 'favicon.run';
  timeFormat: string;
  dateFormat: string;
  background: {
    dark: number;
    dark2: number;
    blur: number;
    type: 'image' | 'builtin' | 'custom';
    key?: string;
    value?: BackgroundItem;
  };
  sites: Array<SiteItem>;
  searches: Array<SearchItem>;
}
export interface SiteItem {
  [SiteItemAlias.id]: string;
  [SiteItemAlias.name]: string;
  [SiteItemAlias.url]: string;
  [SiteItemAlias.iconType]: 'builtin' | 'auto' | 'local' | 'custom';
  [SiteItemAlias.icon]?: string;
}

export interface SearchItem {
  [SearchItemAlias.key]: string;
  [SearchItemAlias.name]: string;
  [SearchItemAlias.url]: string;
  [SearchItemAlias.showOn]: number;
  [SearchItemAlias.suggestion]?: string;
  [SearchItemAlias.suggestionType]?: 'json' | 'jsonp';
  [SearchItemAlias.extractSuggestion]?: string;
}

export interface BackgroundItem {
  [BackgroundItemAlias.key]: string;
  [BackgroundItemAlias.name]?: string;
  [BackgroundItemAlias.url]: string;
  [BackgroundItemAlias.type]: 'api' | 'image' | 'custom';
  // 单位：分钟
  [BackgroundItemAlias.refresh]: number | 'new-day';
  [BackgroundItemAlias.extract]: string;
}
