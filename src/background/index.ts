import createApiHandler from './api-handler';
import { initBg } from './bg';
import { initContextMenus } from './context-menus';
import { getNewTabs } from './utils';

let initd = false;
function init() {
  if (initd) {
    return;
  }
  initd = true;
  createApiHandler();
  initBg();
  initContextMenus();

  getNewTabs().then(tabs =>
    tabs.forEach(tab => {
      chrome.tabs.update(tab.id, {
        url: chrome.runtime.getURL('new-tab.html'),
      });
    }),
  );
}

try {
  chrome.runtime.onStartup.addListener(init);
} catch (_e) {
  // ignore
}
init();
