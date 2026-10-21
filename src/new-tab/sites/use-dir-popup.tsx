import { useCallback, useState } from 'react';
import {
  isSiteDirItem,
  type SiteDirItem,
  type SiteItem,
  type SiteNode,
} from '@/share/types';
import { SiteDirPopup } from './site-dir-popup';
import { openSiteEditModal } from './site-edit';
import { getId } from './site-ops';

export interface DirPopupOptions {
  /**
   * 弹层里把子项拖出文件夹后（moveOutOfDir 已生效）调用。
   * flex 不需要；grid 用它把回到根级的站点落进格子。
   */
  onDropOutside?: (siteId: string) => void;
}

/**
 * 编辑态里「打开文件夹弹层」的状态：
 * 两种布局共用同一套 `openDirId` + 节点点击分发 + 弹层渲染。
 */
export const useDirPopup = (
  sites: SiteNode[],
  showName: boolean,
  options?: DirPopupOptions,
) => {
  const [openDirId, setOpenDirId] = useState<string | null>(null);

  const openDir = openDirId
    ? (sites.find(s => getId(s) === openDirId) as SiteDirItem | undefined)
    : undefined;

  const close = useCallback(() => setOpenDirId(null), []);

  /** 点击节点的分发：文件夹开弹层，站点进编辑弹窗（点击守卫由调用方先判） */
  const openNode = useCallback((node: SiteNode) => {
    if (isSiteDirItem(node)) {
      setOpenDirId(getId(node));
    } else {
      openSiteEditModal({ initialData: { ...(node as SiteItem) } });
    }
  }, []);

  const popup = openDir ? (
    <SiteDirPopup
      site={openDir}
      showName={showName}
      editing
      onClose={close}
      onDropOutside={options?.onDropOutside}
    />
  ) : null;

  return { openDirId, openNode, popup };
};
