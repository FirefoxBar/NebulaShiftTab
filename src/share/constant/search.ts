import { initFlag, packFlags } from '../bool-flags';
import { SearchItemAlias } from '../type-alias';
import { SearchItem } from '../types';

export const SearchItemShowOnFlag = {
  HOME: initFlag(0),
  CONTEXT_MENU: initFlag(1),
};

export const searchItemShowOnAll = packFlags(true, true);
const showOnContextMenu = packFlags(false, true);

export const searchEngines: SearchItem[] = [
  {
    [SearchItemAlias.key]: 'google',
    [SearchItemAlias.name]: 'Google',
    [SearchItemAlias.url]: 'https://www.google.com/search?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://suggestqueries.google.com/complete/search?client=chrome&q={{q}}&hl=zh-CN&gl=CN',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$[1]',
  },
  {
    [SearchItemAlias.key]: 'bing',
    [SearchItemAlias.name]: 'Bing',
    [SearchItemAlias.url]: 'https://cn.bing.com/search?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://api.bing.com/osjson.aspx?query={{q}}&language=zh-CN',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$[1]',
  },
  {
    [SearchItemAlias.key]: 'baidu',
    [SearchItemAlias.name]: '百度',
    [SearchItemAlias.url]: 'https://www.baidu.com/s?wd={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://suggestion.baidu.com/su?wd={{q}}&cb=sug',
    [SearchItemAlias.suggestionType]: 'jsonp',
    [SearchItemAlias.extractSuggestion]: '$.s',
  },
  {
    [SearchItemAlias.key]: 'bilibili',
    [SearchItemAlias.name]: '哔哩哔哩',
    [SearchItemAlias.url]: 'https://search.bilibili.com/all?keyword={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://api.bilibili.com/x/web-interface/suggest?term={{q}}',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.data.result.tag.value',
  },
  {
    [SearchItemAlias.key]: 'github',
    [SearchItemAlias.name]: 'GitHub',
    [SearchItemAlias.url]: 'https://github.com/search?q={{q}}',
    [SearchItemAlias.showOn]: showOnContextMenu,
  },
  {
    [SearchItemAlias.key]: 'mdn',
    [SearchItemAlias.name]: 'Mozilla Developer Network',
    [SearchItemAlias.url]: 'https://developer.mozilla.org/en-US/search?q={{q}}',
    [SearchItemAlias.showOn]: showOnContextMenu,
  },
  {
    [SearchItemAlias.key]: 'taobao',
    [SearchItemAlias.name]: '淘宝',
    [SearchItemAlias.url]: 'https://s.taobao.com/search?q={{q}}',
    [SearchItemAlias.showOn]: showOnContextMenu,
  },
  {
    [SearchItemAlias.key]: 'jd',
    [SearchItemAlias.name]: '京东',
    [SearchItemAlias.url]: 'https://search.jd.com/Search?keyword={{q}}',
    [SearchItemAlias.showOn]: showOnContextMenu,
  },
];

export const defaultSearchEngines = [
  searchEngines[0],
  searchEngines[1],
  searchEngines[2],
  searchEngines[3],
];
