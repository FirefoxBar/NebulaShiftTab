import type React from 'react';
import { lazy, Suspense, useState } from 'react';
import { SettingIcon } from './icon';

const SettingSideSheet = lazy(() => import('./content'));

const Setting: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => setVisible(!visible);

  return (
    <>
      <div className="setting-icon" onClick={toggleVisible}>
        <SettingIcon />
      </div>
      {visible && (
        <Suspense fallback={null}>
          <SettingSideSheet visible={visible} setVisible={setVisible} />
        </Suspense>
      )}
    </>
  );
};

export default Setting;
