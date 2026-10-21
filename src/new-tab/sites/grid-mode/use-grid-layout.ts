import { type CSSProperties, useMemo } from 'react';
import usePref from '@/hooks/use-pref';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteNode } from '@/share/types';
import { reconcileGrid } from './grid-store';

export interface GridLayout {
  /** 根级站点（调用方喂给 useDirPopup 等） */
  sites: SiteNode[];
  cols: number;
  /** 实际渲染的行数 = 配置行数 / cells 占用行数 / 调用方的待提交行数 */
  rows: number;
  /** 补齐到 cols*rows 的格子（null = 空白区块） */
  cells: Array<string | null>;
  /** id → 节点，供格子渲染时反查 */
  nodeById: Map<string, SiteNode>;
  /** 容器 style：宽度 = cols*图标大小 + (cols-1)*间隔 */
  style: CSSProperties;
}

/** 把 cells 补齐到 cols*rows（超出的保持原样，由 reconcile 去尾巴） */
const buildCells = (
  cells: Array<string | null>,
  cols: number,
  rows: number,
): Array<string | null> => {
  const out: Array<string | null> = [];
  for (let i = 0; i < cols * rows; i++) {
    out.push(cells[i] ?? null);
  }
  return out;
};

/** 格子按位置对齐，位置即身份；空白格子用下标兜底 */
export const gridCellKey = (id: string | null, index: number) =>
  id ? `cell-${id}` : `cell-empty#${index}`;

/**
 * grid 布局推导：sites / siteGrid 都在这里订阅，对外只暴露渲染结果。
 * cells 在渲染期跟 sites 对账（纯计算，不写回）—— 死 id 清空、重复清空、
 * 还没落位的根站点补进空格；写路径的持久化由 grid-store 的写函数负责。
 */
export const useGridLayout = (
  /** 本地还没提交到 pref 的行数 */
  pendingRows = 0,
): GridLayout => {
  const [sites] = usePref('sites');
  const [grid] = usePref('siteGrid');
  const [siteSize] = usePref('siteSize');
  const [siteGap] = usePref('siteGap');

  // usePref 的值只在 prefs.set 真变化时换引用（isEqual 去重），依赖稳定
  const synced = useMemo(
    () => reconcileGrid(sites, grid) ?? grid,
    [sites, grid],
  );
  const nodeById = useMemo(
    () => new Map(sites.map(s => [s[SiteItemAlias.id], s])),
    [sites],
  );

  const cols = synced.cols;
  const rows = Math.max(
    synced.rows,
    Math.ceil(synced.cells.length / cols) || 0,
    pendingRows,
  );

  return {
    sites,
    cols,
    rows,
    cells: buildCells(synced.cells, cols, rows),
    nodeById,
    style: {
      width: siteSize * cols + siteGap * (cols - 1),
      gridTemplateColumns: `repeat(${cols}, ${siteSize}px)`,
      gap: siteGap,
    },
  };
};
