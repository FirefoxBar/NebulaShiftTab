import { useLatest } from 'ahooks';
import { useEffect, useState } from 'react';

export const useReadStorage = <T = any>(
  storage: chrome.storage.StorageArea,
  key: string,
  defaultValue: any,
  onGetValue?: (value: any) => T,
) => {
  const [state, setState] = useState<T>(defaultValue);
  const onGetValueRef = useLatest(onGetValue);

  useEffect(() => {
    const onValueUpdate = (value: any) => {
      if (!(key in value) || !value[key]) {
        return;
      }
      const newValue = onGetValueRef.current
        ? onGetValueRef.current?.(value[key])
        : value[key];
      if (newValue) {
        setState(newValue as T);
      }
    };

    const handleChange = (changes: any) => onValueUpdate(changes);

    storage.get(key, value => onValueUpdate(value));
    storage.onChanged.addListener(handleChange);
    return () => {
      storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  return state;
};
