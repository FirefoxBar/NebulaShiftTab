import ReactDOM from 'react-dom/client';
import { StorageKey } from '@/share/constant';
import { getAndWatch, local } from '@/share/storage';
import { Search } from './search';
import Setting from './setting';
import { Sites } from './sites';
import { initThemeHandler } from './theme-handler';

import './index.less';

const Page = () => (
  <>
    <Search />
    <Sites />
    <Setting />
  </>
);

getAndWatch(local, StorageKey.bg, x => {
  if (x) {
    document.body.style.backgroundImage = `url(${x})`;
  }
});

initThemeHandler();

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    // <React.StrictMode>
    <Page />,
    // </React.StrictMode>,
  );
}
