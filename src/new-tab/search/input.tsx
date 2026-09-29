import { IconHistory, IconSearch } from '@douyinfe/semi-icons';
import { useGetState, useLatest, useRequest, useUpdateEffect } from 'ahooks';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import { useReadStorage } from '@/hooks/use-storage';
import { MAX_SUGGESTION_COUNT } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { getSyncStorage } from '@/share/storage';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';
import { createJsonAta, extractData, parseJsonp } from '@/share/utils';
import { SearchIcon } from './search-icon';

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

interface SearchInputProps {
  engine: SearchItem;
}

interface SearchSlugItem {
  type: 'history' | 'suggestion';
  value: string;
}

async function doSearch(engine?: SearchItem, key?: string) {
  if (!engine || !key) return;
  let wait = 0;
  const recordHistory = prefs.get('recordHistory');
  if (recordHistory > 0) {
    const currentHistory = await getSyncStorage('searchHistory');
    if (Array.isArray(currentHistory)) {
      currentHistory.unshift(key);
      if (currentHistory.length > recordHistory) {
        currentHistory.pop();
      }
      await chrome.storage.sync.set({ searchHistory: currentHistory });
    } else {
      await chrome.storage.sync.set({ searchHistory: [key] });
    }
    wait = 100;
  }
  const searchUrl = engine[SearchItemAlias.url].replace(
    '{{q}}',
    encodeURIComponent(key),
  );
  setTimeout(() => {
    window.location.href = searchUrl;
  }, wait);
}

const EMPTY_ARR: SearchSlugItem[] = [];
export const SearchInput = withErrorBoundary(({ engine }: SearchInputProps) => {
  const engineRef = useRef(engine);
  const [searchValue, setSearchValue, getSearchValue] = useGetState('');
  const [searchInputValue, setSearchInputValue, getSearchInputValue] =
    useGetState('');
  const [active, setActive] = useState(false);
  const [_showSuggestion, setShowSuggestion] = useState(false);
  const [
    activeSuggestionIndex,
    setActiveSuggestionIndex,
    getActiveSuggestionIndex,
  ] = useGetState(-1);
  const searchHistory = useReadStorage<SearchSlugItem[]>(
    chrome.storage.sync,
    'searchHistory',
    [],
    value =>
      value.map((item: string) => ({
        type: 'history',
        value: item,
      })),
  );

  const searchInputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 使用useRequest处理搜索建议
  const { data } = useRequest(
    async () => {
      const response = await fetch(
        engine[SearchItemAlias.suggestion]!.replace(
          '{{q}}',
          encodeURIComponent(searchValue),
        ),
      );

      if (!response.ok) {
        throw new Error(t('failedToGetSuggestions'));
      }

      let data: any;
      if (engine[SearchItemAlias.suggestionType] === 'json') {
        data = await response.json();
      } else if (engine[SearchItemAlias.suggestionType] === 'jsonp') {
        // 对于 JSONP 类型，我们需要获取文本并解析
        const text = await decodeResponse(response);
        data = await parseJsonp(text);
      }

      if (data) {
        // 使用 jsonata 提取建议数据
        const expression = await createJsonAta(
          engine[SearchItemAlias.extractSuggestion]!,
        );
        const extractedSuggestions =
          (await extractData<string[]>(expression, data)) || [];
        let result = extractedSuggestions.map(item => ({
          type: 'suggestion',
          value: String(item),
        }));
        if (searchHistory) {
          result = [
            ...searchHistory.filter(item => item.value.includes(searchValue)),
            ...result.filter(
              x => !searchHistory.some(y => y.value === x.value),
            ),
          ];
        }
        return result.length > MAX_SUGGESTION_COUNT
          ? result.slice(0, MAX_SUGGESTION_COUNT)
          : result;
      }

      return EMPTY_ARR;
    },
    {
      refreshDeps: [searchValue, engine],
      ready: Boolean(
        searchValue.trim() &&
          engine[SearchItemAlias.suggestion] &&
          engine[SearchItemAlias.suggestionType] &&
          engine[SearchItemAlias.extractSuggestion],
      ),
      debounceWait: 300,
    },
  );

  const suggestions = data || searchHistory || EMPTY_ARR;
  const suggestionsRef = useLatest(suggestions);
  const showSuggestions = _showSuggestion && suggestions.length > 0;

  useUpdateEffect(() => {
    setShowSuggestion(true);
  }, [engine]);

  // 处理搜索值变化
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setActiveSuggestionIndex(-1);
      setSearchValue(value);
      setSearchInputValue(value);
    },
    [],
  );

  // 处理搜索提交
  const handleSearchSubmit = useCallback(
    () => doSearch(engineRef.current, getSearchValue()),
    [],
  );

  // 选择建议项
  const handleSuggestionClick = (suggestion: string) =>
    doSearch(engineRef.current, suggestion);

  // 键盘导航处理
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      console.log(e.key);
      if (e.key === 'Escape') {
        setShowSuggestion(false);
        e.preventDefault();
        if (getSearchValue() !== getSearchInputValue()) {
          setSearchInputValue(getSearchValue());
        }
        return;
      }
      setShowSuggestion(true);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => {
          const s = suggestionsRef.current!;
          const newIndex = prev < s.length - 1 ? prev + 1 : prev;
          setSearchInputValue(s[newIndex].value);
          return newIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => {
          const s = suggestionsRef.current!;
          const newIndex = prev > 0 ? prev - 1 : -1;
          setSearchInputValue(s[newIndex].value);
          return newIndex;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (
          getActiveSuggestionIndex() >= 0 &&
          suggestionsRef.current &&
          suggestionsRef.current[getActiveSuggestionIndex()]
        ) {
          handleSuggestionClick(
            suggestionsRef.current[getActiveSuggestionIndex()].value,
          );
        } else {
          handleSearchSubmit();
        }
      }
    },
    [],
  );

  // 处理输入框聚焦
  const handleFocus = useCallback(() => {
    // 清除之前的 blur 定时器，防止误关闭
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    setActive(true);
    setShowSuggestion(true);
  }, []);

  // 处理输入框失焦
  const handleBlur = useCallback(() => {
    // 使用定时器延迟关闭，允许点击建议项
    blurTimerRef.current = setTimeout(() => {
      setActive(false);
      setShowSuggestion(false);
      setActiveSuggestionIndex(-1);
      if (getSearchValue() !== getSearchInputValue()) {
        setSearchInputValue(getSearchValue());
      }
      blurTimerRef.current = null;
    }, 150);
  }, []);

  return (
    <div
      className={`search-input-wrapper ${active ? 'active' : ''} ${showSuggestions ? 'show-suggestions' : ''}`}
    >
      <input
        ref={searchInputRef}
        type="text"
        value={searchInputValue}
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
      {showSuggestions ? (
        <ul className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.value}
              className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
              onClick={() => handleSuggestionClick(suggestion.value)}
            >
              {suggestion.type === 'history' ? (
                <IconHistory className="icon" />
              ) : (
                <IconSearch className="icon" />
              )}
              {suggestion.value}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
