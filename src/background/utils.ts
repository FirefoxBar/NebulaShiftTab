export async function getNewTabs() {
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
  return tabs.filter(x => patterns.some(y => (x.url || '').startsWith(y)));
}
