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

const setGrid = (grid: SiteGridConfig) => prefs.set('siteGrid', grid);

/**
 * 读一份「跟 sites 对过账」的 grid：渲染期只算不写（useGridLayout 里的 memo），
 * 所以 pref 的 cells 可能残留死 id（比如删除站点只写了 sites）。
 * 写路径统一以它为基底，顺带把 pref 洗干净 —— reconcileGrid 是纯函数，
 * 和渲染那份的计算结果必然一致。
 */
const getSyncedGrid = (): SiteGridConfig =>
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
    const empty = cells.indexOf(null);
    if (empty !== -1) {
      cells[empty] = id;
    } else {
      cells.push(id);
    }
    seen.add(id);
    changed = true;
  }

  const minLen = grid.cols * grid.rows;
  if (cells.length < minLen) {
    while (cells.length < minLen) cells.push(null);
    changed = true;
  }
  while (cells.length > minLen && cells[cells.length - 1] === null) {
    cells.pop();
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

/**
 * 把回到根级的站点放进第一个空格（文件夹弹层拖出后调用），没有空格就追加。
 * 让 grid 在 sites 变化后立刻拿到落位，不必等下一次渲染期对账。
 */
export const placeSiteInFirstEmptyCell = (siteId: string) => {
  const grid = getSyncedGrid();
  const cells = [...grid.cells];
  const empty = cells.indexOf(null);
  if (empty === -1) cells.push(siteId);
  else cells[empty] = siteId;
  setGrid({ ...grid, cells });
};

export const resizeGrid = (cols: number, rows: number) => {
  const grid = getGrid();
  const safeCols = Math.max(1, Math.min(24, Math.floor(cols) || 1));
  const safeRows = Math.max(1, Math.min(16, Math.floor(rows) || 1));
  const sites = getSites();
  const next: SiteGridConfig = {
    cols: safeCols,
    rows: safeRows,
    cells: grid.cells,
  };
  const synced = reconcileGrid(sites, next) ?? next;
  setGrid(synced);
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

  // 目标空 → 直接移动（文件夹也只能拖到空格，所以走不到下面的合并）
  if (!dstId) {
    cells[toIndex] = srcId;
    setGrid({ ...grid, cells });
    return { kind: 'move' };
  }

  // 目标是站点 → 在目标格创建文件夹；目标是文件夹 → 放进去
  const merged = mergeNodes(getSites(), srcId, dstId);
  if (!merged) return { kind: 'none' };

  cells[toIndex] = merged.dirId ?? dstId;
  prefs.set('sites', merged.sites);
  setGrid({ ...grid, cells });
  return merged.dirId
    ? { kind: 'create-dir', dirId: merged.dirId }
    : { kind: 'merge-dir', dirId: dstId };
};
