import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { withErrorBoundary } from '@/components/error-boundary';
import { SiteIcon } from '@/components/site-icon';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteDirItem as TSiteDirItem } from '@/share/types';
import { SiteItem } from './site-item';

interface SiteDirItemProps {
  showName?: boolean;
  site: TSiteDirItem;
}

export const SiteDirItem = withErrorBoundary<SiteDirItemProps>(
  ({ site, showName = true }) => {
    const [open, setOpen] = useState(false);
    const preview = (site[SiteItemAlias.children] ?? []).slice(0, 4);
    const all = site[SiteItemAlias.children] ?? [];

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
      if (!open) {
        return;
      }
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          close();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [open, close]);

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
          <div className="site-list icon">
            {preview.map(child => (
              <SiteIcon key={child[SiteItemAlias.id]} site={child} />
            ))}
          </div>
          {showName && (
            <div className="title" title={site[SiteItemAlias.name]}>
              {site[SiteItemAlias.name]}
            </div>
          )}
        </div>
        {open &&
          createPortal(
            <div className="site-dir-mask" onClick={close}>
              <div
                className="site-dir-popup"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-label={site[SiteItemAlias.name]}
              >
                <div className="popup-title">{site[SiteItemAlias.name]}</div>
                <div className="sites-container">
                  <div className="sites">
                    {all.map(child => (
                      <SiteItem
                        key={child[SiteItemAlias.id]}
                        site={child}
                        showName={showName}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  },
);
