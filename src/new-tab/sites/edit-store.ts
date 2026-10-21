import { useSyncExternalStore } from 'react';

/**
 * 编辑模式是临时状态，不写入 PrefValue。
 * 按钮与站点区是兄弟节点，用模块级 store 通信。
 */
let editing = false;
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const getSnapshot = () => editing;

export const setEditing = (value: boolean) => {
  if (value === editing) return;
  editing = value;
  listeners.forEach(cb => cb());
};

export const toggleEditing = () => setEditing(!editing);

export const useEditing = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
