import ReactDOM from 'react-dom/client';
import { StorageKey } from '@/share/constant';
import { prefs } from '@/share/prefs';
import { getLocalStorage } from '@/share/storage';
import { Search } from './search';
import Setting from './setting';
import { Sites } from './sites';

import './index.less';
import isDarkMode from '@/share/is-dark-mode';

const Page = () => {
  return (
    <>
      <Search />
      <Sites />
      <Setting />
    </>
  );
};

const bgEl = document.createElement('div');
bgEl.className = 'main-bg';
document.body.appendChild(bgEl);

const updateDark = (dark: number) => {
  if (dark === 0) {
    bgEl.style.backgroundColor = 'transparent';
    return;
  }
  if (dark < 10) {
    bgEl.style.backgroundColor = `rgba(0,0,0,0.0${dark})`;
    return;
  }
  bgEl.style.backgroundColor = `rgba(0,0,0,0.${dark})`;
};

prefs.ready(() => {
  const { dark } = prefs.get('background');
  updateDark(dark);
  if (isDarkMode()) {
    document.body.setAttribute('theme-mode', 'dark');
  }
});

prefs.watchKey('background', ({ dark }) => updateDark(dark));

getLocalStorage(StorageKey.bg).then(x => {
  if (x) {
    document.body.style.backgroundImage = `url(${x})`;
  }
});

chrome.storage.local.onChanged.addListener(changed => {
  if (StorageKey.bg in changed) {
    const { newValue } = changed[StorageKey.bg];
    if (newValue) {
      document.body.style.backgroundImage = `url(${newValue})`;
    }
  }
});

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    // <React.StrictMode>
    <Page />,
    // </React.StrictMode>,
  );
}
