import createApiHandler from './api-handler';
import { initBg } from './bg';
import { initContextMenus } from './context-menus';

let initd = false;
function init() {
  if (initd) {
    return;
  }
  initd = true;
  createApiHandler();
  initBg();
  initContextMenus();
}

try {
  chrome.runtime.onStartup.addListener(init);
} catch (_e) {
  // ignore
}
init();
