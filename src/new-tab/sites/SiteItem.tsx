import type React from 'react';
import { SiteIcon } from '@/components/site-icon';
import type { SiteItem as TSiteItem } from '@/share/types';

import './site-item.less';

interface SiteItemProps {
  site: TSiteItem;
}

export const SiteItem: React.FC<SiteItemProps> = ({ site }) => {
  return (
    <a href={site.url} className="site-item">
      <div className="site-icon-container">
        <SiteIcon site={site} />
      </div>
      <div className="site-name">{site.name}</div>
    </a>
  );
};
