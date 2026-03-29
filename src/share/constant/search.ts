import { initFlag, packFlags } from '../bool-flags';
import { SearchItemAlias } from '../type-alias';
import type { SearchItem } from '../types';

export const SearchItemShowOnFlag = {
  HOME: initFlag(0),
  CONTEXT_MENU: initFlag(1),
};

export const searchItemShowOnAll = packFlags(true, true);

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
    [SearchItemAlias.key]: '360',
    [SearchItemAlias.name]: '360搜索',
    [SearchItemAlias.url]: 'https://www.so.com/s?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://sug.so.360.cn/suggest?encodein=utf-8&encodeout=utf-8&format=json&word={{q}}&fields=word',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.result.word',
  },
  {
    [SearchItemAlias.key]: 'douyin-so',
    [SearchItemAlias.name]: '抖音搜索',
    [SearchItemAlias.url]:
      'https://so.douyin.com/s?search_entrance=aweme&keyword={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://so.douyin.com/aweme/v1/m_web/search/sug/?keyword={{q}}&aid=581610',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.sug_list.content',
  },
  {
    [SearchItemAlias.key]: 'douyin-web',
    [SearchItemAlias.name]: '抖音',
    [SearchItemAlias.url]: 'https://www.douyin.com/search/{{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]:
      'https://www-hj.douyin.com/aweme/v1/web/search/sug/?aid=6383&keyword={{q}}',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.sug_list.content',
  },
  {
    [SearchItemAlias.key]: 'xiaohongshu',
    [SearchItemAlias.name]: '小红书',
    [SearchItemAlias.url]:
      'https://www.xiaohongshu.com/search_result?keyword={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'github',
    [SearchItemAlias.name]: 'GitHub',
    [SearchItemAlias.url]: 'https://github.com/search?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'mdn',
    [SearchItemAlias.name]: 'Mozilla Developer Network',
    [SearchItemAlias.url]: 'https://developer.mozilla.org/en-US/search?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'youtube',
    [SearchItemAlias.name]: 'YouTube',
    [SearchItemAlias.url]: 'https://www.youtube.com/results?search_query={{q}}',
    [SearchItemAlias.suggestion]:
      'https://suggestqueries-clients6.youtube.com/complete/search?client=youtube&q={{q}}&hl=zh-cn&gl=hk',
    [SearchItemAlias.suggestionType]: 'jsonp',
    [SearchItemAlias.extractSuggestion]: '$[1].*[0]',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'duckduckgo',
    [SearchItemAlias.name]: 'DuckDuckGo',
    [SearchItemAlias.url]: 'https://duckduckgo.com/?q={{q}}',
    [SearchItemAlias.suggestion]: 'https://duckduckgo.com/ac/?q={{q}}',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '$.phrase',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'taobao',
    [SearchItemAlias.name]: '淘宝',
    [SearchItemAlias.url]: 'https://s.taobao.com/search?q={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
  {
    [SearchItemAlias.key]: 'jd',
    [SearchItemAlias.name]: '京东',
    [SearchItemAlias.url]: 'https://search.jd.com/Search?keyword={{q}}',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
  },
];

export const defaultSearchEngines = [
  searchEngines[0],
  searchEngines[1],
  searchEngines[2],
  searchEngines[3],
];
