import type React from 'react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { SettingIcon } from './icon';

const SettingSideSheet = lazy(() => import('./content'));

const Setting: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (visible && !loaded) {
      setLoaded(true);
    }
  }, [visible]);

  const loadSideSheet = visible || loaded;

  return (
    <>
      <div
        className="setting-icon"
        onClick={() => setVisible(true)}
        onMouseEnter={() => setLoaded(true)}
      >
        <SettingIcon />
      </div>
      {loadSideSheet && (
        <Suspense fallback={null}>
          <SettingSideSheet visible={visible} setVisible={setVisible} />
        </Suspense>
      )}
    </>
  );
};

export default Setting;
