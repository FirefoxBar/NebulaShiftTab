import { IconEdit, IconTickCircle } from '@douyinfe/semi-icons';
import { useCallback } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { toggleEditing, useEditing } from './edit-store';
import { preloadEdit } from './mode-shell';

/**
 * 右下角、设置按钮左侧的「编辑站点」开关。
 * 只切换状态；真正的编辑态代码在 flex/grid-mode 里按需加载
 * （hover 时预热对应的编辑 chunk，点击后几乎零等待）。
 */
export const EditToggle = withErrorBoundary(() => {
  const editing = useEditing();
  const [mode] = usePref('siteMode');

  const preload = useCallback(() => preloadEdit(mode), [mode]);

  return (
    <div
      className="edit-toggle"
      title={editing ? t('exitEditSites') : t('editSites')}
      onClick={toggleEditing}
      onMouseEnter={preload}
      onFocus={preload}
    >
      {editing ? <IconTickCircle /> : <IconEdit />}
    </div>
  );
});
