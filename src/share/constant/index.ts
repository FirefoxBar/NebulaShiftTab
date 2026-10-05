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
  ON_DRIVE_LOGIN = 'on-drive-login',
}

export const MAX_SUGGESTION_COUNT = 12;

export const defaultPrefValue: PrefValue = {
  darkMode: 'auto',
  theme: 'default',
  iconProvider: 'duckduckgo',
  timeFormat: 'HH:mm',
  dateFormat: 'M月D日 dddd LMLD',
  siteSize: 84,
  siteWidth: 805,
  siteGap: 36,
  showSiteName: true,
  recordHistory: MAX_SUGGESTION_COUNT,
  background: {
    dark: 40,
    dark2: 60,
    blur: 0,
    type: 'builtin',
    key: 'bing',
  },
  customCSS: '',
  searches: defaultSearchEngines,
  sites: [],
};
