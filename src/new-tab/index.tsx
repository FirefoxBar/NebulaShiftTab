// run init first
import './init';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { StorageKey } from '@/share/constant';
import { getAndWatch, local } from '@/share/storage';
import { Search } from './search';
import Setting from './setting';
import { Sites } from './sites';
import { Time } from './time';

import './index.less';

const Page = () => (
  <>
    <Time />
    <Search />
    <Sites />
    <Setting />
  </>
);

const bgImgEl = document.createElement('div');
bgImgEl.className = 'main-bg-img';
document.body.appendChild(bgImgEl);
getAndWatch(local, StorageKey.bg, x => {
  if (x) {
    bgImgEl.style.backgroundImage = `url(${x})`;
  }
});

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Page />,
    </React.StrictMode>,
  );
}
