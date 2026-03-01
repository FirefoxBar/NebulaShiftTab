import ReactDOM from 'react-dom/client';
import { StorageKey } from '@/share/constant';
import isDarkMode from '@/share/is-dark-mode';
import { prefs } from '@/share/prefs';
import { getAndWatch, getLocalStorage, local } from '@/share/storage';
import { themeInfo } from '@/share/theme';
import { Search } from './search';
import Setting from './setting';
import { Sites } from './sites';

import './index.less';

const Page = () => (
  <>
    <Search />
    <Sites />
    <Setting />
  </>
);

const bgEl = document.createElement('div');
bgEl.className = 'main-bg';
document.body.appendChild(bgEl);

prefs.getAndWatch('background', ({ dark }) => {
  if (dark === 0) {
    bgEl.style.backgroundColor = 'transparent';
    return;
  }
  if (dark < 10) {
    bgEl.style.backgroundColor = `rgba(0,0,0,0.0${dark})`;
    return;
  }
  bgEl.style.backgroundColor = `rgba(0,0,0,0.${dark})`;
});

prefs.getAndWatch('theme', theme => {
  const el = document.getElementById('theme-css');
  const hasCSS = Boolean(themeInfo[theme]?.css);
  if (!hasCSS) {
    if (el) {
      el.remove();
    }
    return;
  }
  // has css
  if (el) {
    (el as HTMLLinkElement).href = `/theme/${theme}/style.css`;
  } else {
    const l = document.createElement('link');
    l.id = 'theme-css';
    l.rel = 'stylesheet';
    l.href = `/theme/${theme}/style.css`;
    document.head.appendChild(l);
  }
});

prefs.ready(() => {
  if (isDarkMode()) {
    document.body.setAttribute('theme-mode', 'dark');
  }
});

getAndWatch(local, StorageKey.bg, x => {
  if (x) {
    document.body.style.backgroundImage = `url(${x})`;
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
