import { SideSheet, TabPane, Tabs } from '@douyinfe/semi-ui';
import type React from 'react';
import { t } from '@/share/locale';
import { BackgroundSetting } from './background';
import { ExportAndImport } from './export-and-import';
import { GeneralSettings } from './general';
import { SearchManager } from './search-manager';
import { SitesManager } from './site-manager';

import '@douyinfe/semi-ui/lib/es/_base/base.css';
import './index.less';

interface SettingSideSheetProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const SettingContent: React.FC<SettingSideSheetProps> = ({
  visible,
  setVisible,
}) => {
  const handleClose = () => {
    setVisible(false);
  };

  return (
    <SideSheet
      title={t('settings')}
      placement="right"
      visible={visible}
      onCancel={handleClose}
      height="100%"
      className="setting-drawer"
    >
      <Tabs type="line">
        <TabPane itemKey="bookmark-management" tab={t('siteManagement')}>
          <SitesManager />
        </TabPane>
        <TabPane itemKey="search-management" tab={t('searchManagement')}>
          <SearchManager />
        </TabPane>
        <TabPane itemKey="background-settings" tab={t('backgroundSettings')}>
          <BackgroundSetting />
        </TabPane>
        <TabPane itemKey="general-settings" tab={t('generalSettings')}>
          <GeneralSettings />
        </TabPane>
        <TabPane itemKey="export-and-import" tab={t('importExport')}>
          <ExportAndImport />
        </TabPane>
      </Tabs>
    </SideSheet>
  );
};

export default SettingContent;