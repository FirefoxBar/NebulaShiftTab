import type React from 'react';
import { useEffect, useState } from 'react';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import usePref from '@/hooks/use-pref';
import { prefs } from '@/share/prefs';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';
import { SiteItem } from './site-item';

import './index.less';

export const Sites: React.FC = () => {
  const [sites] = usePref('sites');

  const iconContext = useSiteIconContext();

  return (
    <div className="sites">
      <div className="sites-container">
        <SiteIconContext.Provider value={iconContext}>
          {sites.map(site => (
            <SiteItem key={site[SiteItemAlias.id]} site={site} />
          ))}
        </SiteIconContext.Provider>
      </div>
    </div>
  );
};
