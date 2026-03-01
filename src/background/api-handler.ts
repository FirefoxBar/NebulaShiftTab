import { APIs } from '@/share/constant';
import { checkBg } from './bg';

export default function createApiHandler() {
  chrome.runtime.onMessage.addListener(request => {
    if (request.method === 'notifyBackground') {
      request.method = request.reason;
      delete request.reason;
    }
    switch (request.method) {
      case APIs.REFRESH_BACKGROUND:
        return checkBg(true);
      default:
        break;
    }
    return false;
  });
}
