import { Suspense } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { lazyModes } from './mode-shell';

/** `.sites` 基础样式（含文件夹弹层）两种模式共用，常驻加载 */
import './flex-mode/index.less';
/** 拖拽指示（插入线 / 拖放高亮）两种模式共用，常驻加载 */
import './drop.less';

export const Sites = withErrorBoundary(() => {
  const [mode] = usePref('siteMode');
  // pref 里可能是历史脏数据，兜底回 flex
  const Mode = lazyModes[mode] ?? lazyModes.flex;

  return (
    <Suspense fallback={null}>
      <Mode />
    </Suspense>
  );
});
