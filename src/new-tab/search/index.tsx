import { useMemo } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { useSearches } from '@/hooks/use-searches';
import { hasFlag } from '@/share/bool-flags';
import { SearchItemShowOnFlag } from '@/share/constant';
import { SearchItemAlias } from '@/share/type-alias';
import { SearchContent } from './content';

import './search.less';

export const Search = withErrorBoundary(() => {
  const { searches } = useSearches();

  const homeSearches = useMemo(
    () =>
      searches.filter(x =>
        hasFlag(x[SearchItemAlias.showOn], SearchItemShowOnFlag.HOME),
      ),
    [searches],
  );

  if (homeSearches.length === 0) {
    return null;
  }

  return <SearchContent engines={homeSearches} />;
});
