import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { isSiteDirItem, type SiteNode } from '@/share/types';
import { AddSiteButton } from '../add-site-button';
import { DeleteBadge, SiteNodeBody } from '../node-body';
import { openSiteEditModal } from '../site-edit';
import { canMergeRoot, getId, mergeRoot, reorderRoot } from '../site-ops';
import { useDirPopup } from '../use-dir-popup';
import useDragList from '../use-drag-list';

/**
 * flex 编辑态：拖拽排序 / 合并、末尾「+」、点击即编辑（而非打开）、
 * 悬停删除角标、文件夹照常打开且标题处可改名。
 * 由 flex-mode/index.tsx 在进入编辑时按需加载。
 */
const FlexEdit = withErrorBoundary(() => {
  const [sites] = usePref('sites');
  const [showName] = usePref('showSiteName');

  const list = useDragList({
    canMerge: canMergeRoot,
    onReorder: reorderRoot,
    onMerge: mergeRoot,
  });
  const { openNode, popup } = useDirPopup(sites, showName);

  const drag = list.drag;
  const draggingId = drag?.id ?? null;

  /** 竖线插入指示器：插到 rest[ins] 这个 item 前面（ins === rest.length 时插到最后） */
  const renderIndicator = () => {
    if (!drag || !drag.layout.length || drag.targetId) return null;
    const rest = drag.layout;
    const atIndexEnd = drag.ins >= rest.length;
    const anchor = atIndexEnd ? rest[rest.length - 1] : rest[drag.ins];
    const left = atIndexEnd ? anchor.left + anchor.width + 6 : anchor.left - 6;
    return (
      <div
        className="site-drop-indicator"
        style={{ left, top: anchor.top, height: anchor.height }}
      />
    );
  };

  const renderNode = (site: SiteNode) => {
    const id = getId(site);
    const isDir = isSiteDirItem(site);
    const isTarget = Boolean(drag && drag.targetId === id);

    const rowStyle: CSSProperties = {
      ...(list.rowStyle(id) ?? {}),
    };

    return (
      <div
        key={id}
        ref={(el: HTMLElement | null) => list.setItemRef(id, el)}
        style={rowStyle}
        className={[
          'item',
          isDir ? 'site-dir-item' : 'site-item',
          draggingId === id ? 'dragging' : '',
          isTarget ? 'drop-target' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerDown={(e: ReactPointerEvent) => list.onPointerDown(e, id)}
        onClick={() => {
          if (list.clickGuard()) return;
          openNode(site);
        }}
      >
        <SiteNodeBody node={site} showName={showName} editing />
        {isTarget && (
          <div className="drop-target-box">
            <span className="drop-target-badge">
              {isDir ? t('placeInFolder') : t('mergeIntoFolder')}
            </span>
          </div>
        )}
        <DeleteBadge node={site} />
      </div>
    );
  };

  return (
    <div className="sites editing" ref={list.containerRef as any}>
      {sites.map(renderNode)}
      <AddSiteButton
        clickGuard={list.clickGuard}
        onAdd={() => openSiteEditModal({})}
      />
      {renderIndicator()}
      {popup}
    </div>
  );
});

export default FlexEdit;
