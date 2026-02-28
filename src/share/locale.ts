export function t(key: string, params?: any, defaultValue?: string) {
  const s = chrome.i18n.getMessage(key, params);
  if (s) {
    return s;
  }
  if (typeof defaultValue !== 'undefined') {
    return defaultValue;
  }
  return key;
}
