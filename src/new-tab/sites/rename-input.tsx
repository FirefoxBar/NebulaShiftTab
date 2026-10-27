import { type FC, useEffect, useState } from 'react';
import { t } from '@/share/locale';
import { renameDir } from './site-ops';

export interface RenameInputProps {
  nodeId: string;
  nodeName: string;
  /** 上下文尺寸钩子（tile 内的 `dir-rename` 等），基础外观由 `.ui-input` 提供 */
  className?: string;
}

/**
 * 内联改名输入框：失焦或回车提交，清空则回滚原值。
 * 父级是可点击 / 可拖的节点，所以点击与按键都不冒泡。
 * flex 文件夹标题与文件夹弹层标题共用这一份交互。
 */
export const RenameInput: FC<RenameInputProps> = ({
  nodeId,
  nodeName,
  className,
}) => {
  const [value, setValue] = useState(nodeName);

  useEffect(() => setValue(nodeName), [nodeName]);

  return (
    <input
      placeholder={t('folderName')}
      type="text"
      className={['ui-input', className].filter(Boolean).join(' ')}
      value={value}
      onChange={e => setValue(e.target.value)}
      onClick={e => e.stopPropagation()}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      onBlur={e => {
        const raw = e.target.value;
        const next = raw.trim();
        if (next !== nodeName) {
          if (next) renameDir(nodeId, next);
          else setValue(nodeName);
        } else if (raw !== nodeName) {
          // 只是多了首尾空白，归一成原值
          setValue(nodeName);
        }
      }}
    />
  );
};
