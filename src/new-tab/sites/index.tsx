import type React from 'react';
import { useEffect, useState } from 'react';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import { prefs } from '@/share/prefs';
import type { SiteItem as TSiteItem } from '@/share/types';
import { SiteItem } from './SiteItem';

import './index.less';

export const Sites: React.FC = () => {
  const [sites, setSites] = useState<TSiteItem[]>([]);

  useEffect(() => {
    // 从prefs中读取站点数据
    const sitesFromPrefs = prefs.get('sites', []);
    setSites([...sitesFromPrefs]);

    // 监听站点数据变化
    const unwatch = prefs.watchKey('sites', updatedSites => {
      setSites([...updatedSites]);
    });

    return () => {
      unwatch();
    };
  }, []);

  const iconContext = useSiteIconContext();

  return (
    <div className="sites">
      <div className="sites-container">
        <SiteIconContext.Provider value={iconContext}>
          {sites.map(site => (
            <SiteItem key={site.id} site={site} />
          ))}
        </SiteIconContext.Provider>
      </div>
    </div>
  );
};
