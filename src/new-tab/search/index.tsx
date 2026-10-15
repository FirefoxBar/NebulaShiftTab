import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { hasFlag } from '@/share/bool-flags';
import { EMPTY_ARR, SearchItemShowOnFlag } from '@/share/constant';
import { SearchItemAlias } from '@/share/type-alias';
import { isValidArray } from '@/share/utils';
import { SearchContent } from './content';

import './search.less';

export const Search = withErrorBoundary(() => {
  const [searches] = usePref('searches', {
    defaultValue: EMPTY_ARR,
    filter: v =>
      v.filter(x =>
        hasFlag(x[SearchItemAlias.showOn], SearchItemShowOnFlag.HOME),
      ),
  });

  if (!isValidArray(searches)) {
    return null;
  }

  return <SearchContent engines={searches} />;
});
