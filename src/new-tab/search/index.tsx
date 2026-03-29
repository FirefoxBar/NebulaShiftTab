import { useRequest } from 'ahooks';
import type React from 'react';
import { useRef, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { hasFlag } from '@/share/bool-flags';
import { SearchItemShowOnFlag } from '@/share/constant';
import { t } from '@/share/locale';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { createJsonAta, extractData, parseJsonp } from '@/share/utils';
import { SearchIcon } from './search-icon';

import './search.less';

async function decodeResponse(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('charset=')) {
    const charset = contentType.split('charset=')[1];
    if (charset.toLowerCase() !== 'utf-8' && charset.toLowerCase() !== 'utf8') {
      const buffer = await response.arrayBuffer();
      const decoder = new TextDecoder(charset);
      return decoder.decode(buffer);
    }
  }
  return response.text();
}

export const Search = withErrorBoundary(() => {
  const [currentEngine, setCurrentEngine] = useState<SearchItem | undefined>();
  const [searchValue, setSearchValue] = useState('');
  const [active, setActive] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [searches] = usePref('searches', {
    onInitial: v => setCurrentEngine(v[0]),
  });

  // 使用useRequest处理搜索建议
  const { data } = useRequest(
    async () => {
      if (
        !currentEngine ||
        !searchValue.trim() ||
        !currentEngine[SearchItemAlias.suggestion] ||
        !currentEngine[SearchItemAlias.suggestionType] ||
        !currentEngine[SearchItemAlias.extractSuggestion]
      ) {
        return [];
      }

      const response = await fetch(
        currentEngine[SearchItemAlias.suggestion]!.replace(
          '{{q}}',
          encodeURIComponent(searchValue),
        ),
      );

      if (!response.ok) {
        throw new Error(t('failedToGetSuggestions'));
      }

      let data: any;
      if (currentEngine[SearchItemAlias.suggestionType] === 'json') {
        data = await response.json();
      } else if (currentEngine[SearchItemAlias.suggestionType] === 'jsonp') {
        // 对于 JSONP 类型，我们需要获取文本并解析
        const text = await decodeResponse(response);
        data = await parseJsonp(text);
      }

      if (data) {
        // 使用 jsonata 提取建议数据
        const expression = await createJsonAta(
          currentEngine[SearchItemAlias.extractSuggestion]!,
        );
        const extractedSuggestions =
          (await extractData<string[]>(expression, data)) || [];
        return extractedSuggestions.map(item => String(item));
      }

      return [];
    },
    {
      refreshDeps: [searchValue, currentEngine],
      debounceWait: 300,
    },
  );

  const suggestions = data || [];
  // const showSuggestions = suggestions.length > 0;
  const showSuggestions = active && suggestions.length > 0;

  // 处理搜索值变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setActiveSuggestionIndex(-1);
    setSearchValue(value);
  };

  // 处理搜索提交
  const handleSearchSubmit = () => {
    if (!currentEngine || !searchValue.trim()) return;

    // 替换 URL 中的{{q}}为实际查询词
    const searchUrl = currentEngine[SearchItemAlias.url].replace(
      '{{q}}',
      encodeURIComponent(searchValue),
    );
    window.location.href = searchUrl;
  };

  // 选择建议项
  const handleSuggestionClick = (suggestion: string) => {
    if (!currentEngine || !suggestion) return;
    const searchUrl = currentEngine[SearchItemAlias.url].replace(
      '{{q}}',
      encodeURIComponent(suggestion),
    );
    window.location.href = searchUrl;
  };

  // 键盘导航处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      } else {
        handleSearchSubmit();
      }
    }
  };

  // 处理输入框聚焦
  const handleFocus = () => {
    // 清除之前的 blur 定时器，防止误关闭
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setActive(true);
  };

  // 处理输入框失焦
  const handleBlur = () => {
    // 使用定时器延迟关闭，允许点击建议项
    blurTimerRef.current = setTimeout(() => {
      setActive(false);
      blurTimerRef.current = null;
    }, 150);
  };

  // 渲染建议列表
  const renderSuggestions = () => {
    if (!showSuggestions || !suggestions.length) return null;

    return (
      <ul className="search-suggestions">
        {suggestions.map((suggestion, index) => (
          <li
            key={suggestion}
            className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
            onMouseEnter={() => setActiveSuggestionIndex(index)}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    );
  };

  // 处理引擎切换并自动聚焦
  const handleEngineChange = (engine: SearchItem) => {
    setCurrentEngine(engine);
    // 切换引擎后自动聚焦到输入框
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  return (
    <div
      className={`search-container ${active ? 'active' : ''} ${showSuggestions ? 'show-suggestions' : ''}`}
    >
      <div className="search-engines">
        {searches
          .filter(x =>
            hasFlag(x[SearchItemAlias.showOn], SearchItemShowOnFlag.HOME),
          )
          .map(engine => (
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

      <div className="search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('enterSearchKeywords')}
          className="search-input"
        />
        <button
          className="search-button"
          onClick={handleSearchSubmit}
          type="button"
        >
          <SearchIcon />
        </button>
      </div>

      {renderSuggestions()}
    </div>
  );
});
