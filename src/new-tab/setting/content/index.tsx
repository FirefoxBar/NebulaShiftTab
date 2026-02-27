import { SideSheet, TabPane, Tabs } from '@douyinfe/semi-ui';
import type React from 'react';
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
      title="设置"
      placement="right"
      visible={visible}
      onCancel={handleClose}
      height="100%"
      className="setting-drawer"
    >
      <Tabs type="line">
        <TabPane itemKey="bookmark-management" tab="站点管理">
          <SitesManager />
        </TabPane>
        <TabPane itemKey="search-management" tab="搜索管理">
          <SearchManager />
        </TabPane>
        <TabPane itemKey="background-settings" tab="背景设置">
          <BackgroundSetting />
        </TabPane>
        <TabPane itemKey="general-settings" tab="通用设置">
          <GeneralSettings />
        </TabPane>
        <TabPane itemKey="export-and-import" tab="导入和导出">
          <ExportAndImport />
        </TabPane>
      </Tabs>
    </SideSheet>
  );
};

export default SettingContent;
