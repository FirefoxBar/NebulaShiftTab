import { BackgroundItemAlias, SearchItemAlias } from './type-alias';
import type { BackgroundItem, PrefValue, SearchItem } from './types';

export const StorageKey = {
  bg: 'bg',
  bgLastUpdate: 'bg-last-update',
  siteIcon: 'site-icon',
};

export enum APIs {}

export const DefaultSearchEngines: SearchItem[] = [
  {
    [SearchItemAlias.key]: 'google',
    [SearchItemAlias.name]: 'Google',
    [SearchItemAlias.url]: 'https://www.google.com/search?q={{q}}',
    [SearchItemAlias.suggestion]:
      'https://suggestqueries.google.com/complete/search?client=chrome&q={{q}}&hl=zh-CN&gl=CN',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$[1]',
  },
  {
    [SearchItemAlias.key]: 'bing',
    [SearchItemAlias.name]: 'Bing',
    [SearchItemAlias.url]: 'https://cn.bing.com/search?q={{q}}',
    [SearchItemAlias.suggestion]:
      'https://api.bing.com/osjson.aspx?query={{q}}&language=zh-CN',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$[1]',
  },
  {
    [SearchItemAlias.key]: 'baidu',
    [SearchItemAlias.name]: '百度',
    [SearchItemAlias.url]: 'https://www.baidu.com/s?wd={{q}}',
    [SearchItemAlias.suggestion]:
      'https://suggestion.baidu.com/su?wd={{q}}&cb=sug',
    [SearchItemAlias.suggestionType]: 'jsonp',
    [SearchItemAlias.extractSuggestion]: '$.s',
  },
  {
    [SearchItemAlias.key]: 'bilibili',
    [SearchItemAlias.name]: '哔哩哔哩',
    [SearchItemAlias.url]: 'https://search.bilibili.com/all?keyword={{q}}',
    [SearchItemAlias.suggestion]:
      'https://api.bilibili.com/x/web-interface/suggest?term={{q}}',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.data.result.tag.value',
  },
];

export const DefaultBackgroundEngines: BackgroundItem[] = [
  {
    [BackgroundItemAlias.key]: 'bing',
    [BackgroundItemAlias.name]: 'Bing',
    [BackgroundItemAlias.url]:
      'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
    [BackgroundItemAlias.type]: 'api',
    [BackgroundItemAlias.refresh]: 'new-day',
    [BackgroundItemAlias.extract]:
      '"https://cn.bing.com" & $.images[0].urlbase & "_1920x1080.jpg"',
  },
  {
    [BackgroundItemAlias.key]: 'spotlight',
    [BackgroundItemAlias.name]: 'Spotlight',
    [BackgroundItemAlias.url]:
      'https://fd.api.iris.microsoft.com/v4/api/selection?placement=88000820&bcnt=4&country=CN&locale=zh-CN&fmt=json',
    [BackgroundItemAlias.type]: 'api',
    [BackgroundItemAlias.refresh]: 'new-day',
    [BackgroundItemAlias.extract]:
      '$json_decode($array_rand($.batchrsp.items).item).ad.landscapeImage.asset',
  },
];

export const defaultPrefValue: PrefValue = {
  darkMode: 'auto',
  theme: 'default',
  iconProvider: 'duckduckgo',
  background: {
    dark: 40,
    type: 'builtin',
    key: 'bing',
  },
  searches: DefaultSearchEngines,
  sites: [],
};
