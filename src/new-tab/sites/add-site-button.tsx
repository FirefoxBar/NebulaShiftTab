import { IconPlus } from '@douyinfe/semi-icons';
import type { FC } from 'react';
import { t } from '@/share/locale';

export interface AddSiteButtonProps {
  /** 拖拽后的同一次点击不应触发添加 */
  clickGuard: () => boolean;
  onAdd: () => void;
}

/**
 * 编辑态的「+」：flex 排在末尾、grid 排在空格子里。
 * 两者共用同一套 DOM 与外观（`.site-add-item`，见 flex-mode/index.less）。
 */
export const AddSiteButton: FC<AddSiteButtonProps> = ({
  clickGuard,
  onAdd,
}) => (
  <button
    type="button"
    className="item site-add-item"
    title={t('addSite')}
    aria-label={t('addSite')}
    onClick={() => {
      if (clickGuard()) return;
      onAdd();
    }}
  >
    <span className="icon add-icon">
      <IconPlus />
    </span>
  </button>
);
