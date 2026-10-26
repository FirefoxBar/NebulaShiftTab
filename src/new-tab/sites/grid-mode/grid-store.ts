import { defaultPrefValue } from '@/share/constant';
import { prefs } from '@/share/prefs';
import type { SiteGridConfig, SiteNode } from '@/share/types';
import { getId, getSites, mergeNodes } from '../site-ops';

export const getGrid = (): SiteGridConfig => {
  const grid = prefs.get('siteGrid');
  if (!grid || !Array.isArray(grid.cells)) {
    return { ...defaultPrefValue.siteGrid };
  }
  return grid;
};

export const setGrid = (grid: SiteGridConfig) => prefs.set('siteGrid', grid);

/**
 * 读一份「跟 sites 对过账」的 grid：渲染期只算不写（useGridLayout 里的 memo），
 * 所以 pref 的 cells 可能残留死 id（比如删除站点只写了 sites）。
 * 写路径统一以它为基底，顺带把 pref 洗干净 —— reconcileGrid 是纯函数，
 * 和渲染那份的计算结果必然一致。
 */
export const getSyncedGrid = (): SiteGridConfig =>
  reconcileGrid(getSites(), getGrid()) ?? getGrid();

/**
 * 让 cells 跟上 sites（唯一事实来源）：
 * - 删除的站点 → 置 null；重复的 id → 保留第一次出现；
 * - 新增的根级站点 → 填进第一个空格，没有则追加；
 * - 补足到 cols*rows，去掉尾部多余的空格。
 * 返回 null 表示无需变更。
 */
export const reconcileGrid = (
  sites: SiteNode[],
  grid: SiteGridConfig,
): SiteGridConfig | null => {
  const rootIds = new Set(sites.map(getId));

  const seen = new Set<string>();
  let changed = false;
  const cells = grid.cells.map(cell => {
    if (!cell || !rootIds.has(cell) || seen.has(cell)) {
      if (cell !== null) changed = true;
      return null;
    }
    seen.add(cell);
    return cell;
  });

  for (const site of sites) {
    const id = getId(site);
    if (seen.has(id)) continue;
    placeAtLastEmptyCell(cells, [id]);
    seen.add(id);
    changed = true;
  }

  if (!changed) return null;
  return { ...grid, cells };
};

/** 把新站点落到指定空格（编辑态空白区块「+」） */
export const placeSiteAtCell = (cellIndex: number, siteId: string) => {
  const grid = getSyncedGrid();
  const cells = [...grid.cells];
  while (cells.length <= cellIndex) cells.push(null);
  // 该 id 已在别处 → 先摘掉
  const existing = cells.indexOf(siteId);
  if (existing !== -1 && existing !== cellIndex) {
    cells[existing] = null;
  }
  cells[cellIndex] = siteId;
  setGrid({ ...grid, cells });
};

export const placeAtLastEmptyCell = (
  cells: Array<string | null>,
  sites: string[],
) => {
  let index = -1;
  for (let i = cells.length - 1; i >= 0; i--) {
    if (cells[i] === null) {
      index = i;
    } else {
      break;
    }
  }
  if (index !== -1) {
    cells.splice(index, cells.length - index, ...sites);
  } else {
    cells.push(...sites);
  }
};

// ---------------------------------------------------------------------------
// 拖放三规则
// ---------------------------------------------------------------------------

export type GridDropResult =
  | { kind: 'none' }
  | { kind: 'move' }
  | { kind: 'merge-dir'; dirId: string }
  | { kind: 'create-dir'; dirId: string };

/**
 * 拖放到区块 `to`：
 * - 目标空 → 移动
 * - 目标是站点 → 与拖入的站点创建文件夹（占目标格）
 * - 目标是文件夹 → 拖入的站点放进该文件夹
 * 拖源统一置空。
 */
export const applyGridDrop = (
  fromIndex: number,
  toIndex: number,
): GridDropResult => {
  const grid = getSyncedGrid();
  if (fromIndex === toIndex) return { kind: 'none' };

  const cells = [...grid.cells];
  while (cells.length <= Math.max(fromIndex, toIndex)) cells.push(null);
  const srcId = cells[fromIndex];
  if (!srcId) return { kind: 'none' };

  const dstId = cells[toIndex];
  cells[fromIndex] = null;

  const checkLastRow = () => {
    // 如果最后一行是空的则移除
    const lastRowIndex = (Math.ceil(cells.length / grid.cols) - 1) * grid.cols;
    const lastRow = cells.slice(lastRowIndex, lastRowIndex + grid.cols);
    if (lastRow.every(cell => cell === null)) {
      cells.length = lastRowIndex;
    }
  };

  // 目标空 → 直接移动（文件夹也只能拖到空格，所以走不到下面的合并）
  if (!dstId) {
    cells[toIndex] = srcId;
    checkLastRow();
    setGrid({ ...grid, cells });
    return { kind: 'move' };
  }

  // 目标是站点 → 在目标格创建文件夹；目标是文件夹 → 放进去
  const merged = mergeNodes(getSites(), srcId, dstId);
  if (!merged) return { kind: 'none' };

  cells[toIndex] = merged.dirId ?? dstId;
  prefs.set('sites', merged.sites);
  checkLastRow();
  setGrid({ ...grid, cells });
  return merged.dirId
    ? { kind: 'create-dir', dirId: merged.dirId }
    : { kind: 'merge-dir', dirId: dstId };
};
