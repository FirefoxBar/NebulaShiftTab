import { InputNumber } from '@douyinfe/semi-ui';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SiteItemAlias } from '@/share/type-alias';
import { isSiteDirItem, type SiteNode } from '@/share/types';
import { AddSiteButton } from '../add-site-button';
import { DeleteBadge, SiteNodeBody } from '../node-body';
import { openSiteEditModal } from '../site-edit';
import { getSites } from '../site-ops';
import { useDirPopup } from '../use-dir-popup';
import {
  applyGridDrop,
  getSyncedGrid,
  placeAtLastEmptyCell,
  placeSiteAtCell,
  setGrid,
} from './grid-store';
import { useDragGrid } from './use-drag-grid';
import { gridCellKey, useGridLayout } from './use-grid-layout';

const writeReconcileGrid = () => setGrid(getSyncedGrid());

/**
 * grid 编辑态：N*M 布局配置、空白区块「+」、
 * 拖放到区块的三规则（空→移动 / 站点→建文件夹 / 文件夹→放入）、
 * 点击即编辑、悬停删除。文件夹打开后的内部布局仍是 flex。
 */
const GridEdit = withErrorBoundary(() => {
  const [showName] = usePref('showSiteName');

  const drag = useDragGrid((from, to) => {
    applyGridDrop(from, to);
  });

  // 行数 = 配置的行数 / cells 实际占用的行数 / 本地待提交的行数
  const { cols, sites, cells, nodeById } = useGridLayout();
  // 拖出文件夹的站点回到根级 → grid 立刻把它落进空格
  const { openNode, popup } = useDirPopup(sites, showName, {
    onDropOutside: writeReconcileGrid,
  });

  const updateCols = (newCols: number) => {
    const { cols: oldCols, cells: oldCells } = getSyncedGrid();
    const diff = newCols - oldCols;
    const oldRows = Math.ceil(oldCells.length / oldCols);
    const newCells: Array<string | null> = [];
    if (diff === 0) return;
    if (diff >= 1) {
      for (let i = 0; i < oldRows; i++) {
        newCells.push(...oldCells.slice(i * oldCols, (i + 1) * oldCols));
        newCells.push(...Array(diff).fill(null));
      }
    } else {
      const rest: string[] = [];
      for (let i = 0; i < oldRows; i++) {
        newCells.push(...oldCells.slice(i * oldCols, i * oldCols + newCols));
        rest.push(
          ...(oldCells
            .slice(i * oldCols + newCols, (i + 1) * oldCols)
            .filter(Boolean) as string[]),
        );
      }
      placeAtLastEmptyCell(newCells, rest);
    }
    prefs.set('siteGrid', { cols: newCols, cells: newCells });
  };

  const resetCols = () => {
    if (!window.confirm(t('gridReset'))) return;
    const { cols } = getSyncedGrid();
    const sites = getSites();
    const newCells: Array<string | null> = [];
    sites.forEach(site => {
      newCells.push(site[SiteItemAlias.id]);
    });
    prefs.set('siteGrid', { cols, cells: newCells });
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
            <DeleteBadge node={node} onDelete={writeReconcileGrid} />
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
            onChange={v => updateCols(Number(v) || 1)}
          />
          <button type="button" className="reset-btn" onClick={resetCols}>
            {t('gridReset')}
          </button>
        </div>
        <div
          className="sites sites-grid editing"
          ref={drag.containerRef as any}
        >
          {cells.map(renderCell)}
          {Array(cols)
            .fill(null)
            .map((_, i) => renderCell(null, i + cells.length))}
        </div>
      </div>
      {popup}
    </>
  );
});

export default GridEdit;
