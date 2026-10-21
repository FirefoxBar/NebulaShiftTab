import { withErrorBoundary } from '@/components/error-boundary';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';
import { SiteNodeBody } from './node-body';

interface SiteItemProps {
  showName?: boolean;
  site: TSiteItem;
}

export const SiteItem = withErrorBoundary<SiteItemProps>(
  ({ site, showName = true }) => (
    <a href={site[SiteItemAlias.url]} className="site-item item">
      <SiteNodeBody node={site} showName={showName} />
    </a>
  ),
);
