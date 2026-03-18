import { lazy, Suspense } from 'react';
import { withErrorBoundary } from '@/components/error-boundary';

import './index.less';

const Content = lazy(() => import('./content'));

export const Time = withErrorBoundary(() => (
  <div className="time-container">
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  </div>
));
