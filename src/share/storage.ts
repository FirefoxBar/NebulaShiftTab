export const { local, sync } = chrome.storage;

export const getStorage = async <T = any>(
  s: chrome.storage.StorageArea,
  key: string,
) => {
  const res = await s.get(key);
  return key in res ? (res[key] as T) : undefined;
};

export const getLocalStorage = async <T = any>(key: string) =>
  getStorage<T>(local, key);

export const getSyncStorage = async <T = any>(key: string) =>
  getStorage<T>(sync, key);
