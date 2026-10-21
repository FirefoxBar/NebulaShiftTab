import { IconSetting } from '@douyinfe/semi-icons';
import { lazy, Suspense, useEffect, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { SiteItemAlias } from '@/share/type-alias';

const SettingSideSheet = lazy(() => import('./content'));

const Setting = withErrorBoundary(() => {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('action') === 'add-site') {
      import('../sites/site-edit').then(({ openSiteEditModal }) => {
        openSiteEditModal({
          initialData: {
            [SiteItemAlias.id]: '',
            [SiteItemAlias.iconType]: 'builtin',
            [SiteItemAlias.name]: query.get('name') || '',
            [SiteItemAlias.url]: query.get('url') || '',
          },
        });
      });
    }
    // add alternative functions
    (window as any).openSetting = () => setVisible(true);
  }, []);

  useEffect(() => {
    if (visible && !loaded) {
      setLoaded(true);
    }
  }, [visible]);

  const loadSideSheet = visible || loaded;

  return (
    <>
      <div
        className="setting-icon"
        onClick={() => setVisible(true)}
        onMouseEnter={() => setLoaded(true)}
      >
        <IconSetting />
      </div>
      {loadSideSheet && (
        <Suspense fallback={null}>
          <SettingSideSheet
            visible={visible}
            handleClose={() => setVisible(false)}
          />
        </Suspense>
      )}
    </>
  );
});

export default Setting;
