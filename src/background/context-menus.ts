import { hasFlag } from '@/share/bool-flags';
import { SearchItemShowOnFlag } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SearchItemAlias } from '@/share/type-alias';
import { getNewTabs } from './utils';

const prefix = 'nebula-shift-tab-';

const noop = () => {
  if (chrome.runtime.lastError) {
    // ignore
  }
};

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
          id: `${prefix}search-${search[SearchItemAlias.key]}`,
          contexts: ['selection'],
          title: search[SearchItemAlias.name],
        },
        noop,
      );
    });

    chrome.contextMenus.create(
      {
        id: `${prefix}add-to-home`,
        contexts: ['link'],
        title: t('addToHome'),
      },
      noop,
    );

    chrome.contextMenus.create(
      {
        id: `${prefix}add-page-to-home`,
        contexts: ['page'],
        title: t('addCurrentPageToHome'),
      },
      noop,
    );
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const { selectionText, linkUrl, pageUrl } = info;
    const menuItemId = String(info.menuItemId);
    if (!menuItemId.startsWith(prefix)) {
      return;
    }
    const id = menuItemId.substring(prefix.length);
    if (id === 'add-page-to-home' && pageUrl && tab) {
      handleAddSite(tab.title || '', pageUrl);
      return;
    }
    if (id === 'add-to-home' && linkUrl) {
      handleAddSite(selectionText || '', linkUrl);
      return;
    }
    if (id.startsWith('search-') && selectionText) {
      const searchKey = id.substring(7);
      handleSearch(searchKey, selectionText);
      return;
    }
  });
}
