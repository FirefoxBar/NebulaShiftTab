import type React from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';

import './site-item.less';

interface SiteItemProps {
  site: TSiteItem;
}

export const SiteItem = withErrorBoundary<SiteItemProps>(({ site }) => (
  <a href={site[SiteItemAlias.url]} className="site-item">
    <SiteIcon site={site} />
    <div className="site-name">{site[SiteItemAlias.name]}</div>
  </a>
));
