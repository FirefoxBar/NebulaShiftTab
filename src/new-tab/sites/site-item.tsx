import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';

import './site-item.less';

interface SiteItemProps {
  showName?: boolean;
  site: TSiteItem;
}

export const SiteItem = withErrorBoundary<SiteItemProps>(
  ({ site, showName = true }) => (
    <a href={site[SiteItemAlias.url]} className="site-item">
      <SiteIcon site={site} />
      {showName && <div className="site-name">{site[SiteItemAlias.name]}</div>}
    </a>
  ),
);
