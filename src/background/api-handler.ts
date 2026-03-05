import { APIs } from '@/share/constant';
import { checkBg } from './bg';

function handleCall(request: any) {
  switch (request.method) {
    case APIs.REFRESH_BACKGROUND:
      return checkBg(true);
    default:
      break;
  }
}

function isPromise(obj: any): obj is Promise<any> {
  return obj && typeof obj.then === 'function';
}

export default function createApiHandler() {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.method === 'notifyBackground') {
      request.method = request.reason;
      delete request.reason;
    }
    const res = handleCall(request);
    if (isPromise(res)) {
      res
        .then(data => sendResponse(data))
        .catch(e => {
          console.error(e);
          sendResponse(null);
        });
      return true;
    }
  });
}
