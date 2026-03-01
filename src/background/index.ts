import createApiHandler from './api-handler';
import { initBg } from './bg';

let initd = false;
function init() {
  if (initd) {
    return;
  }
  initd = true;
  createApiHandler();
  initBg();
}

try {
  chrome.runtime.onStartup.addListener(init);
} catch (_e) {
  // ignore
}
init();
