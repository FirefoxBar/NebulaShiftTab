import { useCallback, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import type { SiteDirItem as TSiteDirItem } from '@/share/types';
import { SiteNodeBody } from './node-body';
import { SiteDirPopup } from './site-dir-popup';

interface SiteDirItemProps {
  showName?: boolean;
  site: TSiteDirItem;
}

export const SiteDirItem = withErrorBoundary<SiteDirItemProps>(
  ({ site, showName = true }) => {
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);

    return (
      <>
        <div
          className="site-dir-item item"
          onClick={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        >
          <SiteNodeBody node={site} showName={showName} />
        </div>
        {open && (
          <SiteDirPopup site={site} showName={showName} onClose={close} />
        )}
      </>
    );
  },
);
