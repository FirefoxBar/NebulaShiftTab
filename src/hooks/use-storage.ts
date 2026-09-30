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
      const newValue = onGetValueRef.current
        ? onGetValueRef.current?.(value)
        : value;
      if (typeof newValue !== 'undefined') {
        setState(newValue as T);
      }
    };

    const handleGet = (value: any) => {
      if (!(key in value)) {
        return;
      }
      onValueUpdate(value[key]);
    };

    const handleChange = (changes: any) => {
      if (!(key in changes)) {
        return;
      }
      onValueUpdate(changes[key].newValue);
    };

    storage.get(key, handleGet);
    storage.onChanged.addListener(handleChange);
    return () => {
      storage.onChanged.removeListener(handleChange);
    };
  }, [key]);

  return state;
};
