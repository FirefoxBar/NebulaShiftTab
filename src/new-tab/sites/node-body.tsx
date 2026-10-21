import { IconClose } from '@douyinfe/semi-icons';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { SiteIcon } from '@/components/site-icon';
import { t } from '@/share/locale';
import { SiteItemAlias } from '@/share/type-alias';
import { isSiteDirItem, type SiteNode } from '@/share/types';
import { RenameInput } from './rename-input';
import { renameDir } from './site-ops';

export interface SiteNodeBodyProps {
  node: SiteNode;
  showName?: boolean;
  /** 编辑态：文件夹标题变改名输入框 */
  editing?: boolean;
}

/**
 * 节点的「身体」：站点是图标 + 标题，文件夹是前 4 个子站点的预览 + 标题。
 * flex / grid 编辑态、文件夹弹层、普通态的文件夹方块共用这一份渲染。
 */
export const SiteNodeBody = ({
  node,
  showName = true,
  editing = false,
}: SiteNodeBodyProps) => {
  if (!isSiteDirItem(node)) {
    const name = node[SiteItemAlias.name];
    return (
      <>
        <SiteIcon site={node} className="icon" />
        {showName && (
          <div className="title" title={name}>
            {name}
          </div>
        )}
      </>
    );
  }

  const name = node[SiteItemAlias.name];
  const preview = (node[SiteItemAlias.children] ?? []).slice(0, 4);
  return (
    <>
      <div className="site-list icon">
        {preview.map(child => (
          <SiteIcon key={child[SiteItemAlias.id]} site={child} />
        ))}
      </div>
      {showName &&
        (editing ? (
          <RenameInput
            className="dir-rename"
            defaultValue={name}
            onCommit={next => renameDir(node[SiteItemAlias.id], next)}
          />
        ) : (
          <div className="title" title={name}>
            {name}
          </div>
        ))}
    </>
  );
};

/** 悬停删除角标；删除确认（semi Modal）按需加载，普通态的 chunk 里不该有它 */
export const DeleteBadge = ({ node }: { node: SiteNode }) => {
  const onClick = async (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const { confirmDeleteNode } = await import('./site-delete');
    confirmDeleteNode(node);
  };

  return (
    <button
      type="button"
      className="delete-badge"
      aria-label={isSiteDirItem(node) ? t('deleteFolder') : t('deleteSite')}
      onClick={onClick}
    >
      <IconClose />
    </button>
  );
};
