export interface PrefValue {
  darkMode: 'auto' | 'on' | 'off';
  iconPack: 'mbe-style' | 'delta-icons' | 'liquid-glass';
  iconProvider: 'google' | 'duckduckgo' | 'icon.horse' | 'browser';
  background: {
    dark: number;
    type: 'image' | 'builtin' | 'custom';
    key?: string;
    value?: BackgroundItem;
  };
  sites: Array<SiteItem>;
  searches: Array<SearchItem>;
}
export interface SiteItem {
  id: string;
  name: string;
  url: string;
  iconType: 'builtin' | 'auto' | 'local' | 'custom';
  icon: string;
}

export interface SearchItem {
  key: string;
  name: string;
  url: string;
  suggestion?: string;
  suggestionType?: 'json' | 'jsonp';
  extractSuggestion?: string;
}

export interface BackgroundItem {
  key: string;
  name: string;
  url: string;
  type: 'api' | 'image' | 'custom';
  // 单位：分钟
  refresh: number | 'new-day';
  extract: string;
  custom?: () => Promise<string>;
}
