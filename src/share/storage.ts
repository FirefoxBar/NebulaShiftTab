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

export const getAndWatch = <T = any>(
  s: chrome.storage.StorageArea,
  key: string,
  callback: (value?: T) => void,
) => {
  getStorage<T>(s, key).then(value => callback(value));
  s.onChanged.addListener(changes => {
    if (key in changes) {
      callback(changes[key].newValue as T);
    }
  });
};
