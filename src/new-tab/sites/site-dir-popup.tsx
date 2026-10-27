import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteDirItem } from '@/share/types';
import { DeleteBadge, SiteNodeBody } from './node-body';
import { RenameInput } from './rename-input';
import { openSiteEditModal } from './site-edit';
import { SiteItem as SiteItemView } from './site-item';
import { moveOutOfDir, reorderInDir } from './site-ops';
import useDragList from './use-drag-list';

import './site-dir-popup.less';

export interface SiteDirPopupProps {
  site: SiteDirItem;
  showName?: boolean;
  /** 编辑态：标题变输入框、子项可排序/拖出/点击编辑 */
  editing?: boolean;
  onClose: () => void;
  /**
   * 子项被拖出文件夹后（moveOutOfDir 已生效）调用。
   * flex 不需要；grid 用它把回到根级的站点落进格子。
   */
  onDropOutside?: (siteId: string) => void;
}

/**
 * 文件夹弹层：flex / grid 两种布局共用，内部永远是 flex 排列。
 * 普通态保持原有交互（点击打开链接）；编辑态的重依赖按需加载。
 */
export const SiteDirPopup = ({
  site,
  showName = true,
  editing = false,
  onClose,
  onDropOutside,
}: SiteDirPopupProps) => {
  const dirId = site[SiteItemAlias.id];
  const children = site[SiteItemAlias.children] ?? [];
  const popupRef = useRef<HTMLDivElement | null>(null);

  const list = useDragList({
    onReorder: (activeId, ins) => reorderInDir(dirId, activeId, ins),
    onDropOutside: activeId => {
      moveOutOfDir(dirId, activeId);
      onDropOutside?.(activeId);
    },
    getBoundaryRect: () => popupRef.current?.getBoundingClientRect() ?? null,
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 拖拽进行中按 Escape 是「取消拖拽」，不要连弹层一起关掉
      if (e.key === 'Escape' && !list.drag) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, list.drag]);

  // 子项都被拖走了就没什么可看的，自动收起
  useEffect(() => {
    if (children.length === 0) onClose();
  }, [children.length, onClose]);

  return createPortal(
    <div
      className={`site-dir-mask${list.drag ? ' has-drag' : ''}`}
      onClick={() => {
        // 刚拖完的那一下点击落在遮罩上，别把它当成「关闭」
        if (list.clickGuard()) return;
        onClose();
      }}
    >
      <div
        className={`site-dir-popup${editing ? ' editing' : ''}`}
        ref={popupRef}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label={site[SiteItemAlias.name]}
      >
        {editing ? (
          <div className="popup-title-input">
            <RenameInput nodeId={dirId} nodeName={site[SiteItemAlias.name]} />
          </div>
        ) : (
          <div className="popup-title">{site[SiteItemAlias.name]}</div>
        )}
        <div className="sites-container">
          <div className="sites" ref={list.containerRef as any}>
            {children.map(child => {
              const childId = child[SiteItemAlias.id];
              const dragging = list.drag?.id === childId;
              if (!editing) {
                return (
                  <SiteItemView
                    key={childId}
                    site={child}
                    showName={showName}
                  />
                );
              }
              return (
                <div
                  key={childId}
                  className={`item dir-child${dragging ? ' dragging' : ''}`}
                  ref={el => list.setItemRef(childId, el)}
                  style={list.rowStyle(childId)}
                  onPointerDown={e => list.onPointerDown(e, childId)}
                  onClick={() => {
                    if (list.clickGuard()) return;
                    openSiteEditModal({ initialData: { ...child } });
                  }}
                >
                  <SiteNodeBody node={child} showName={showName} editing />
                  <DeleteBadge node={child} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SiteDirPopup;
