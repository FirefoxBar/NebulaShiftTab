import { hasFlag } from '@/share/bool-flags';
import { SearchItemShowOnFlag } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SearchItemAlias } from '@/share/type-alias';

const noop = () => {
  if (chrome.runtime.lastError) {
    // ignore
  }
};

async function getNewTabs() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
  });
  const patterns = [
    'chrome://newtab/',
    'edge://newtab/',
    'about:newtab',
    'chrome://startpage/',
    'browser://newtab/',
    chrome.runtime.getURL('new-tab.html'),
  ];
  console.log(tabs.map(x => x.url));
  return tabs.filter(x => patterns.includes(x.url || ''));
}

async function openOrUpdate(url: string) {
  const newTabs = await getNewTabs();
  if (newTabs.length === 0) {
    chrome.tabs.create({
      url,
    });
  } else {
    chrome.tabs.update(newTabs[0].id, {
      url,
      active: true,
    });
  }
}

async function handleAddSite(name: string, url: string) {
  openOrUpdate(
    `${chrome.runtime.getURL('new-tab.html')}?action=add-site&name=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}`,
  );
}

async function handleSearch(searchKey: string, query: string) {
  const search = prefs
    .get('searches')
    .find(s => s[SearchItemAlias.key] === searchKey);
  if (!search) {
    return;
  }
  openOrUpdate(
    search[SearchItemAlias.url].replace('{{q}}', encodeURIComponent(query)),
  );
}

export function initContextMenus() {
  prefs.getAndWatch('searches', async searches => {
    await chrome.contextMenus.removeAll();

    searches.forEach(search => {
      if (
        !hasFlag(
          search[SearchItemAlias.showOn],
          SearchItemShowOnFlag.CONTEXT_MENU,
        )
      ) {
        return;
      }
      chrome.contextMenus.create(
        {
          id: `nebula-shift-tab-search-${search[SearchItemAlias.key]}`,
          contexts: ['selection'],
          title: search[SearchItemAlias.name],
        },
        noop,
      );
    });

    chrome.contextMenus.create(
      {
        id: 'nebula-shift-tab-add-to-home',
        contexts: ['link'],
        title: t('addToHome'),
      },
      noop,
    );
  });

  chrome.contextMenus.onClicked.addListener(info => {
    const { menuItemId, selectionText, linkUrl } = info;
    if (menuItemId === 'nebula-shift-tab-add-to-home' && linkUrl) {
      handleAddSite(selectionText || '', linkUrl);
      return;
    }
    if (
      typeof menuItemId === 'string' &&
      menuItemId.startsWith('nebula-shift-tab-search-') &&
      selectionText
    ) {
      const searchKey = menuItemId.substring(24);
      handleSearch(searchKey, selectionText);
      return;
    }
  });
}
