import type React from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import { SiteItemAlias } from '@/share/type-alias';
import { SiteItem } from './site-item';

import './index.less';

export const Sites = withErrorBoundary(() => {
  const [sites] = usePref('sites');
  const [width] = usePref('siteWidth');

  const iconContext = useSiteIconContext();

  return (
    <div className="sites" style={{ width: `${width}px` }}>
      <SiteIconContext.Provider value={iconContext}>
        {sites.map(site => (
          <SiteItem key={site[SiteItemAlias.id]} site={site} />
        ))}
      </SiteIconContext.Provider>
    </div>
  );
});
