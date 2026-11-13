import { useGetState } from 'ahooks';
import { useEffect } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { SearchInput } from './input';

interface SearchContentProps {
  engines: SearchItem[];
}

export const SearchContent = withErrorBoundary(
  ({ engines }: SearchContentProps) => {
    const [current, setCurrent, getCurrent] = useGetState<SearchItem>(
      engines[0],
    );

    useEffect(() => {
      if (getCurrent()) {
        const has = engines.find(
          x => x[SearchItemAlias.key] === getCurrent()[SearchItemAlias.key],
        );
        setCurrent(has || engines[0]);
      } else {
        setCurrent(engines[0]);
      }
    }, [engines]);

    return (
      <div className="search-container">
        {engines.length > 1 && (
          <div className="search-engines">
            {engines.map(engine => (
              <button
                key={engine[SearchItemAlias.key]}
                type="button"
                className={`engine-btn ${current?.[SearchItemAlias.key] === engine[SearchItemAlias.key] ? 'active' : ''}`}
                onClick={() => setCurrent(engine)}
              >
                {engine[SearchItemAlias.name]}
              </button>
            ))}
          </div>
        )}

        <SearchInput engine={current} />
      </div>
    );
  },
);
