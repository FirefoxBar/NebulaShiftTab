import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { hasFlag } from '@/share/bool-flags';
import { SearchItemShowOnFlag } from '@/share/constant';
import { SearchItemAlias } from '@/share/type-alias';
import { SearchContent } from './content';

import './search.less';

export const Search = withErrorBoundary(() => {
  const [searches] = usePref('searches', {
    filter: v =>
      v.filter(x =>
        hasFlag(x[SearchItemAlias.showOn], SearchItemShowOnFlag.HOME),
      ),
  });

  if (searches.length === 0) {
    return null;
  }

  return <SearchContent engines={searches} />;
});
