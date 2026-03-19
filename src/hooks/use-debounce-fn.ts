import { useLatest, useUnmount } from 'ahooks';
import type { DebounceOptions } from 'ahooks/es/useDebounce/debounceOptions';
import { debounce } from 'lodash-es';
import { useCallback, useMemo } from 'react';

type noop = (...args: any[]) => any;

function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
  const fnRef = useLatest(fn);

  const wait = options?.wait ?? 1000;

  const runImmediate = useCallback((...args: Parameters<T>): ReturnType<T> => {
    return fnRef.current?.(...args);
  }, []);

  const debounced = useMemo(() => debounce(runImmediate, wait, options), []);

  useUnmount(() => {
    debounced.cancel();
  });

  return {
    run: debounced,
    runImmediate,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
}

export default useDebounceFn;
