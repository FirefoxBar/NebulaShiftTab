import type { FC } from 'react';

export interface RenameInputProps {
  /** 初始值：失焦时拿它判断「改了没」，清空也回滚到它 */
  defaultValue: string;
  /** trim 后非空且与原值不同才回调 */
  onCommit: (next: string) => void;
  /** 上下文尺寸钩子（tile 内的 `dir-rename` 等），基础外观由 `.ui-input` 提供 */
  className?: string;
  placeholder?: string;
}

/**
 * 内联改名输入框：失焦或回车提交，清空则回滚原值。
 * 父级是可点击 / 可拖的节点，所以点击与按键都不冒泡。
 * flex 文件夹标题与文件夹弹层标题共用这一份交互。
 */
export const RenameInput: FC<RenameInputProps> = ({
  defaultValue,
  onCommit,
  className,
  placeholder,
}) => (
  <input
    type="text"
    className={['ui-input', className].filter(Boolean).join(' ')}
    defaultValue={defaultValue}
    placeholder={placeholder}
    onClick={e => e.stopPropagation()}
    onKeyDown={e => {
      e.stopPropagation();
      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
    }}
    onBlur={e => {
      const raw = e.target.value;
      const next = raw.trim();
      if (next !== defaultValue) {
        if (next) onCommit(next);
        else e.target.value = defaultValue;
      } else if (raw !== defaultValue) {
        // 只是多了首尾空白，归一成原值
        e.target.value = defaultValue;
      }
    }}
  />
);
