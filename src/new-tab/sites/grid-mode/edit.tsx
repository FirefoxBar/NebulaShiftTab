import { InputNumber } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { SiteItemAlias } from '@/share/type-alias';
import { isSiteDirItem, type SiteNode } from '@/share/types';
import { AddSiteButton } from '../add-site-button';
import { DeleteBadge, SiteNodeBody } from '../node-body';
import { openSiteEditModal } from '../site-edit';
import { useDirPopup } from '../use-dir-popup';
import {
  applyGridDrop,
  placeSiteAtCell,
  placeSiteInFirstEmptyCell,
  resizeGrid,
} from './grid-store';
import { useDragGrid } from './use-drag-grid';
import { gridCellKey, useGridLayout } from './use-grid-layout';

/**
 * grid 编辑态：N*M 布局配置、空白区块「+」、
 * 拖放到区块的三规则（空→移动 / 站点→建文件夹 / 文件夹→放入）、
 * 点击即编辑、悬停删除。文件夹打开后的内部布局仍是 flex。
 */
const GridEdit = withErrorBoundary(() => {
  const [showName] = usePref('showSiteName');
  // 仅布局栏草稿的初值/同步用（布局计算本身在 useGridLayout 里订阅）
  const [grid] = usePref('siteGrid');
  const [cols, setCols] = useState(grid.cols);
  const [rows, setRows] = useState(grid.rows);

  useEffect(() => {
    setCols(grid.cols);
    setRows(grid.rows);
  }, [grid.cols, grid.rows]);

  const drag = useDragGrid((from, to) => {
    applyGridDrop(from, to);
  });

  // 行数 = 配置的行数 / cells 实际占用的行数 / 本地待提交的行数
  const { sites, cells, nodeById, style } = useGridLayout(rows);
  // 拖出文件夹的站点回到根级 → grid 立刻把它落进空格
  const { openNode, popup } = useDirPopup(sites, showName, {
    onDropOutside: placeSiteInFirstEmptyCell,
  });

  const commitLayout = (nextCols: number, nextRows: number) => {
    setCols(nextCols);
    setRows(nextRows);
    resizeGrid(nextCols, nextRows);
  };

  /**
   * 松手是否真的会生效（对齐 applyGridDrop 的三规则）：
   * 源格子是空的、或源是文件夹而目标已被占用 → 既不高亮也不给文案。
   */
  const canDrop = (index: number) => {
    const from = drag.drag?.from;
    if (from === undefined) return false;
    const srcId = cells[from] ?? null;
    if (!srcId) return false;
    const dstId = cells[index] ?? null;
    if (!dstId) return true;
    const srcNode = nodeById.get(srcId);
    return Boolean(srcNode) && !isSiteDirItem(srcNode);
  };

  const renderCell = (id: string | null, index: number) => {
    const node: SiteNode | null = id ? (nodeById.get(id) ?? null) : null;
    const over = drag.isOver(index) && canDrop(index);
    const cls = ['grid-cell', node ? '' : 'empty', over ? 'drop-target' : '']
      .filter(Boolean)
      .join(' ');

    return (
      <div
        key={gridCellKey(id, index)}
        className={cls}
        style={drag.cellStyle(index)}
        ref={el => drag.setItemRef(index, el)}
        onPointerDown={e => drag.onPointerDown(e, index)}
      >
        {node ? (
          <div
            className={[
              'item',
              isSiteDirItem(node) ? 'site-dir-item' : 'site-item',
            ].join(' ')}
            onClick={() => {
              if (drag.clickGuard()) return;
              openNode(node);
            }}
          >
            <SiteNodeBody node={node} showName={showName} editing />
            <DeleteBadge node={node} />
          </div>
        ) : (
          <AddSiteButton
            clickGuard={drag.clickGuard}
            onAdd={() =>
              openSiteEditModal({
                onSave: site => placeSiteAtCell(index, site[SiteItemAlias.id]),
              })
            }
          />
        )}
        {over && (
          <div className="drop-target-box">
            {/* 空格子 = 移动，没有对应文案，只给高亮 */}
            {node && (
              <span className="drop-target-badge">
                {isSiteDirItem(node)
                  ? t('placeInFolder')
                  : t('mergeIntoFolder')}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid-edit">
        <div className="grid-layout-bar">
          <span className="grid-layout-label">{t('gridCols')}</span>
          <InputNumber
            min={1}
            max={24}
            value={cols}
            onChange={v => commitLayout(Number(v) || 1, rows)}
          />
          <span className="grid-layout-label">{t('gridRows')}</span>
          <InputNumber
            min={1}
            max={16}
            value={rows}
            onChange={v => commitLayout(cols, Number(v) || 1)}
          />
        </div>
        <div
          className="sites sites-grid editing"
          ref={drag.containerRef as any}
          style={style}
        >
          {cells.map(renderCell)}
        </div>
      </div>
      {popup}
    </>
  );
});

export default GridEdit;
