import { List, Select, Typography } from '@douyinfe/semi-ui';
import type React from 'react';
import usePref from '@/hooks/use-pref';

export const GeneralSettings: React.FC = () => {
  const [darkMode, setDarkMode] = usePref('darkMode');
  const [iconPack, setIconPack] = usePref('iconPack');
  const [iconProvider, setIconProvider] = usePref('iconProvider');

  return (
    <List className="setting-list">
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">深色模式</Typography.Text>
          </div>
        }
        extra={
          <Select
            value={darkMode}
            placeholder="选择深色模式设置"
            onChange={v => setDarkMode(v as any)}
          >
            <Select.Option value="auto">跟随系统</Select.Option>
            <Select.Option value="on">开启</Select.Option>
            <Select.Option value="off">关闭</Select.Option>
          </Select>
        }
      />
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">图标包</Typography.Text>
          </div>
        }
        extra={
          <Select
            value={iconPack}
            placeholder="选择图标包"
            onChange={v => setIconPack(v as any)}
          >
            <Select.Option value="mbe-style">MBE Style</Select.Option>
            <Select.Option value="delta-icons">Delta Icons</Select.Option>
            <Select.Option value="liquid-glass">液态玻璃</Select.Option>
          </Select>
        }
      />
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">图标提供者</Typography.Text>
            <Typography.Text type="quaternary" className="content">
              当选择“自动获取”时，将从该源获取图标
            </Typography.Text>
          </div>
        }
        extra={
          <Select
            value={iconProvider}
            placeholder="选择图标提供商"
            onChange={v => setIconProvider(v as any)}
          >
            <Select.Option value="google">Google</Select.Option>
            <Select.Option value="duckduckgo">DuckDuckGo</Select.Option>
            <Select.Option value="icon.horse">icon.horse</Select.Option>
          </Select>
        }
      />
    </List>
  );
};
