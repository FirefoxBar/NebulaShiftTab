import type { SiteItem, SiteNode } from '@/share/types';

export interface SiteEditModalOptions {
  initialData?: SiteItem;
  onSave?: (site: SiteItem, sites: SiteNode[]) => void;
  onCancel?: () => void;
}

/**
 * 添加/编辑站点弹窗的按需加载入口。
 * 表单本身较重（semi Form / Upload / ColorPicker），调用时才动态加载。
 */
export const openSiteEditModal = (options: SiteEditModalOptions = {}) =>
  import('./site-edit-modal').then(({ showSiteEditModal }) =>
    showSiteEditModal(options),
  );
