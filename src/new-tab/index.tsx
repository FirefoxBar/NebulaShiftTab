// run init first
import './init';

import React from 'react';
import ReactDOM from 'react-dom/client';
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

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Page />,
    </React.StrictMode>,
  );
}
