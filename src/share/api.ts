import { APIs } from './constant';

export const refreshBackground = async () =>
  chrome.runtime.sendMessage({
    method: 'notifyBackground',
    reason: APIs.REFRESH_BACKGROUND,
  });
