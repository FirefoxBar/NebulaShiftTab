import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';

interface SiteItemProps {
  showName?: boolean;
  site: TSiteItem;
}

export const SiteItem = withErrorBoundary<SiteItemProps>(
  ({ site, showName = true }) => (
    <a href={site[SiteItemAlias.url]} className="site-item item">
      <SiteIcon site={site} className="icon" />
      {showName && (
        <div className="title" title={site[SiteItemAlias.name]}>
          {site[SiteItemAlias.name]}
        </div>
      )}
    </a>
  ),
);
