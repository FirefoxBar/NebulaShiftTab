import { useCallback, useEffect, useRef, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { SearchInput } from './input';

interface SearchContentProps {
  engines: SearchItem[];
}

export const SearchContent = withErrorBoundary(
  ({ engines }: SearchContentProps) => {
    const [currentEngine, setCurrentEngine] = useState<SearchItem>(engines[0]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // 处理引擎切换并自动聚焦
    const handleEngineChange = useCallback((engine: SearchItem) => {
      setCurrentEngine(engine);
      // 切换引擎后自动聚焦到输入框
      setTimeout(() => {
        // setShowSuggestion(true);
        searchInputRef.current?.focus();
      }, 0);
    }, []);

    useEffect(() => {
      setCurrentEngine(engines[0]);
    }, [engines]);

    return (
      <div className="search-container">
        {engines.length > 1 && (
          <div className="search-engines">
            {engines.map(engine => (
              <button
                key={engine[SearchItemAlias.name]}
                type="button"
                className={`engine-btn ${currentEngine?.[SearchItemAlias.name] === engine[SearchItemAlias.name] ? 'active' : ''}`}
                onClick={() => handleEngineChange(engine)}
              >
                {engine[SearchItemAlias.name]}
              </button>
            ))}
          </div>
        )}

        <SearchInput engine={currentEngine} />
      </div>
    );
  },
);
