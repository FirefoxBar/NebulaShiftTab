import { lazy, Suspense } from 'react';

import './index.less';

const Content = lazy(() => import('./content'));

export const Time = () => (
  <div className="time-container">
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  </div>
);
