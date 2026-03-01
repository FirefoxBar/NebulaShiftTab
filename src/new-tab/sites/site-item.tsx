import type React from 'react';
import { SiteIcon } from '@/components/site-icon';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';

import './site-item.less';

interface SiteItemProps {
  site: TSiteItem;
}

export const SiteItem: React.FC<SiteItemProps> = ({ site }) => (
  <a href={site[SiteItemAlias.url]} className="site-item">
    <div className="site-icon-container">
      <SiteIcon site={site} />
    </div>
    <div className="site-name">{site[SiteItemAlias.name]}</div>
  </a>
);
