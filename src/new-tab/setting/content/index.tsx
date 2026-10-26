import { SideSheet, TabPane, Tabs } from '@douyinfe/semi-ui';
import type React from 'react';
import SemiLocale from '@/components/semi-locale';
import { t } from '@/share/locale';
import { BackgroundSetting } from './background';
import { GeneralSettings } from './general';
import { SearchManager } from './search-manager';

import '@douyinfe/semi-ui/lib/es/_base/base.css';
import './index.less';
import { Advanced } from './advanced';
import Backup from './backup';

interface SettingSideSheetProps {
  visible: boolean;
  handleClose: () => void;
}

const SettingContent: React.FC<SettingSideSheetProps> = ({
  visible,
  handleClose,
}) => (
  <SemiLocale>
    <SideSheet
      title={t('settings')}
      placement="right"
      visible={visible}
      onCancel={handleClose}
      height="100%"
      className="setting-drawer"
    >
      <Tabs type="line" lazyRender={true}>
        <TabPane itemKey="search" tab={t('searchEngine')}>
          <SearchManager />
        </TabPane>
        <TabPane itemKey="background" tab={t('background')}>
          <BackgroundSetting />
        </TabPane>
        <TabPane itemKey="general" tab={t('general')}>
          <GeneralSettings />
        </TabPane>
        <TabPane itemKey="backup" tab={t('backup')}>
          <Backup />
        </TabPane>
        <TabPane itemKey="advanced" tab={t('advanced')}>
          <Advanced />
        </TabPane>
      </Tabs>
    </SideSheet>
  </SemiLocale>
);

export default SettingContent;
