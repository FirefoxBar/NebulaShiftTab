import Modal from '@/components/modal';
import { t } from '@/share/locale';
import { SiteItemAlias } from '@/share/type-alias';
import { isSiteDirItem, type SiteNode } from '@/share/types';
import { deleteDirNode, deleteSiteNode, getId } from './site-ops';

/**
 * 删除确认。semi Modal 较重，只允许编辑态（按需加载）引入，
 * 普通态永远不应该 import 到这里。
 */
export const confirmDeleteNode = (node: SiteNode, onDelete?: () => void) => {
  const isDir = isSiteDirItem(node);
  const name = node[SiteItemAlias.name];

  Modal.warning({
    title: isDir ? t('deleteFolder') : t('deleteSite'),
    content: isDir
      ? t('confirmDeleteFolder', name)
      : t('confirmDeleteSite', name),
    okText: t('delete'),
    onOk: () => {
      if (isDir) {
        deleteDirNode(getId(node));
        onDelete?.();
      } else {
        deleteSiteNode(getId(node));
      }
    },
  });
};
