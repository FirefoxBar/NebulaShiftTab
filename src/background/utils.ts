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
  ];
  // console.log(tabs.map(x => x.url));
  return tabs.filter(x => patterns.includes(x.url || ''));
}
