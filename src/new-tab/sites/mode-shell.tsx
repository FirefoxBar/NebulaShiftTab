import {
  type ComponentType,
  type LazyExoticComponent,
  lazy,
  Suspense,
} from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import type { PrefValue, SiteNode } from '@/share/types';
import { useEditing } from './edit-store';

/** 各布局模式的代码分包：默认 flex，grid 及其编辑态按需加载 */
const editLoaders: Record<
  PrefValue['siteMode'],
  () => Promise<{ default: ComponentType }>
> = {
  flex: () => import('./flex-mode/edit'),
  grid: () => import('./grid-mode/edit'),
};

/**
 * 模块级创建的 lazy 组件：放在渲染里每次 new 一个的话，
 * React 会认为组件类型变了，整棵子树重新挂载。
 */
export const lazyModes: Record<
  PrefValue['siteMode'],
  LazyExoticComponent<ComponentType>
> = {
  flex: lazy(() => import('./flex-mode')),
  grid: lazy(() => import('./grid-mode')),
};

/** 提前把对应模式的编辑 chunk 拉下来，点击后几乎零等待 */
export const preloadEdit = (mode: PrefValue['siteMode']) => {
  editLoaders[mode]();
};

export interface ModeShellContent {
  sites: SiteNode[];
  showName: boolean;
}

/**
 * flex / grid 两种布局的公共外壳：
 * 读 pref、编辑态开关、图标上下文、编辑 chunk 的按需加载。
 * 各模式只需要给出「非编辑态渲染成什么」的组件。
 */
export const withModeShell = (
  mode: PrefValue['siteMode'],
  Normal: ComponentType<ModeShellContent>,
) => {
  const Edit = lazy(editLoaders[mode]);

  return withErrorBoundary(() => {
    const [sites] = usePref('sites');
    const [showName] = usePref('showSiteName');
    const editing = useEditing();
    const iconContext = useSiteIconContext();

    const content = editing ? (
      <Suspense fallback={null}>
        <Edit />
      </Suspense>
    ) : (
      <Normal sites={sites} showName={showName} />
    );

    return (
      <SiteIconContext.Provider value={iconContext}>
        {content}
      </SiteIconContext.Provider>
    );
  });
};
