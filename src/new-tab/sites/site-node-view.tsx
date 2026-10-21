import { isSiteDirItem, type SiteNode } from '@/share/types';
import { SiteDirItem } from './site-dir-item';
import { SiteItem } from './site-item';

/**
 * 普通态（非编辑）的节点渲染：文件夹方块 / 站点链接。
 * 编辑态的节点身体在 `node-body.tsx`。
 */
export const SiteNodeView = ({
  site,
  showName = true,
}: {
  site: SiteNode;
  showName?: boolean;
}) =>
  isSiteDirItem(site) ? (
    <SiteDirItem site={site} showName={showName} />
  ) : (
    <SiteItem site={site} showName={showName} />
  );
