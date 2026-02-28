import type { BackgroundItem, PrefValue, SearchItem } from './types';

export const StorageKey = {
  bg: 'bg',
  bgLastUpdate: 'bg-last-update',
  siteIcon: 'site-icon',
};

export enum APIs {}

export const DefaultSearchEngines: SearchItem[] = [
  {
    key: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q={{q}}',
    suggestion:
      'https://suggestqueries.google.com/complete/search?client=chrome&q={{q}}&hl=zh-CN&gl=CN',
    suggestionType: 'json',
    extractSuggestion: '$[1]',
  },
  {
    key: 'bing',
    name: 'Bing',
    url: 'https://cn.bing.com/search?q={{q}}',
    suggestion: 'https://api.bing.com/osjson.aspx?query={{q}}&language=zh-CN',
    suggestionType: 'json',
    extractSuggestion: '$[1]',
  },
  {
    key: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd={{q}}',
    suggestion: 'https://suggestion.baidu.com/su?wd={{q}}&cb=sug',
    suggestionType: 'jsonp',
    extractSuggestion: '$.s',
  },
  {
    key: 'bilibili',
    name: '哔哩哔哩',
    url: 'https://search.bilibili.com/all?keyword={{q}}',
    suggestion: 'https://api.bilibili.com/x/web-interface/suggest?term={{q}}',
    suggestionType: 'json',
    extractSuggestion: '$.data.result.tag.value',
  },
];

export const DefaultBackgroundEngines: BackgroundItem[] = [
  {
    key: 'bing',
    name: 'Bing',
    url: 'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
    type: 'api',
    refresh: 'new-day',
    extract: '"https://cn.bing.com" & $.images[0].urlbase & "_1920x1080.jpg"',
  },
  {
    key: 'spotlight',
    name: 'Spotlight',
    url: 'https://fd.api.iris.microsoft.com/v4/api/selection?placement=88000820&bcnt=4&country=CN&locale=zh-CN&fmt=json',
    type: 'custom',
    refresh: 'new-day',
    extract:
      '$json_decode($array_rand($.batchrsp.items).item).ad.landscapeImage.asset',
  },
];

export const defaultPrefValue: PrefValue = {
  darkMode: 'auto',
  iconPack: 'default',
  iconProvider: 'duckduckgo',
  background: {
    dark: 40,
    type: 'builtin',
    key: 'bing',
  },
  searches: DefaultSearchEngines,
  sites: [],
};
