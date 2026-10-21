import { useCallback } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { toggleEditing, useEditing } from './edit-store';
import { preloadEdit } from './mode-shell';

const EditIcon = () => (
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M729.01639585 99.17174518l110.37233304 113.86758637a63.76895525 63.76895525 0 0 1-0.93206756 89.71150223l-497.1026963 492.59770311h-151.07261628a47.14708385 47.14708385 0 0 1-47.14708386-47.22475614V602.2552083l519.31697303-504.09320297a47.14708385 47.14708385 0 0 1 66.64283023 1.00973985zM215.29182815 632.78042075v90.41055288h96.3136474l470.22808178-465.87843318-87.22598874-89.94451912L215.13648355 632.78042075z m-36.19529007 314.72814458c-19.88410785 0-36.03994548-17.39859437-36.03994549-38.83614815s16.15583763-38.83614815 36.03994549-38.83614815h665.80692384c19.88410785 0 36.03994548 17.39859437 36.03994549 38.83614815s-16.15583763 38.83614815-36.03994549 38.83614815H179.09653808z"
      fill="currentColor"
    ></path>
  </svg>
);

const ExitIcon = () => (
  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M785.375 785.375A386.62499971 386.62499971 0 1 1 361.99999971 155.75000029a386.62499971 386.62499971 0 0 1 423.37500029 629.62499971zM512 62a450 450 0 1 0 450 450A450 450 0 0 0 512 62z m184.12499971 268.49999971l-288 288.75000058-74.99999971-131.25000058a31.5 31.5 0 0 0-54.74999971 31.5l95.625 167.25000058a31.87500029 31.87500029 0 0 0 27.37499942 16.12499942 31.5 31.5 0 0 0 15.37500058-3.375 33.00000029 33.00000029 0 0 0 7.49999971-5.99999942l316.50000029-318.00000058a31.5 31.5 0 0 0-44.62500058-45z"
      fill="currentColor"
    ></path>
  </svg>
);

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
      {editing ? <ExitIcon /> : <EditIcon />}
    </div>
  );
});
