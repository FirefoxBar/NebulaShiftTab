import type { PrefValue } from '../types';
import {
  defaultSearchEngines,
  SearchItemShowOnFlag,
  searchEngines,
  searchItemShowOnAll,
} from './search';

export { backgroundEngines } from './background';

export {
  defaultSearchEngines,
  searchEngines,
  searchItemShowOnAll,
  SearchItemShowOnFlag,
};

export const StorageKey = {
  bg: 'bg',
  bgLastUpdate: 'bg-last-update',
  siteIcon: 'site-icon',
};

export enum APIs {
  REFRESH_BACKGROUND = 'refresh-background',
}

export const defaultPrefValue: PrefValue = {
  darkMode: 'auto',
  theme: 'default',
  iconProvider: 'duckduckgo',
  background: {
    dark: 40,
    dark2: 40,
    blur: 0,
    type: 'builtin',
    key: 'bing',
  },
  searches: defaultSearchEngines,
  sites: [],
};
