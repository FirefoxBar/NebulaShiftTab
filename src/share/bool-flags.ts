export const initFlag = (pos: number) => 1 << pos;
export const setFlag = (packedValue: number, flag: number) =>
  packedValue | flag;
export const hasFlag = (packedValue: number, flag: number) =>
  (packedValue & flag) !== 0;

// 将多个布尔值打包成一个数字
export const packFlags = (...flags: boolean[]) =>
  flags.reduce((acc, flag, index) => (flag ? acc | (1 << index) : acc), 0);
