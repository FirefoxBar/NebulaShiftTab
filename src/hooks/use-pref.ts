import { useCallback, useEffect, useState } from 'react';
import { defaultPrefValue } from '../share/constant';
import emitter from '../share/emitter';
import { prefs } from '../share/prefs';
import type { PrefValue } from '../share/types';

const usePref = <K extends keyof PrefValue>(
  key: K,
  options?: {
    onInitial?: (value: PrefValue[K]) => void;
  },
): [PrefValue[K], (value: PrefValue[K]) => void] => {
  const [state, setState] = useState(defaultPrefValue[key]);

  useEffect(() => {
    prefs.ready(() => {
      const value = prefs.get(key);
      setState(value);
      options?.onInitial?.(value);
    });
    const handler = (k: keyof PrefValue, val: any) => {
      if (key === k) {
        setState(val);
      }
    };
    emitter.on(emitter.EVENT_PREFS_UPDATE, handler);
    return () => {
      emitter.off(emitter.EVENT_PREFS_UPDATE, handler);
    };
  }, [key]);

  const set = useCallback(
    (value: PrefValue[K]) => {
      prefs.set(key, value);
      setState(value);
    },
    [key],
  );

  return [state, set];
};

export default usePref;
