import { List, Select, Typography } from '@douyinfe/semi-ui';
import type React from 'react';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';

export const GeneralSettings: React.FC = () => {
  const [darkMode, setDarkMode] = usePref('darkMode');
  const [iconPack, setIconPack] = usePref('iconPack');
  const [iconProvider, setIconProvider] = usePref('iconProvider');

  return (
    <List className="setting-list">
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">{t('darkMode')}</Typography.Text>
          </div>
        }
        extra={
          <Select
            value={darkMode}
            placeholder={t('selectDarkMode')}
            onChange={v => setDarkMode(v as any)}
          >
            <Select.Option value="auto">{t('followSystem')}</Select.Option>
            <Select.Option value="on">{t('on')}</Select.Option>
            <Select.Option value="off">{t('off')}</Select.Option>
          </Select>
        }
      />
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">{t('iconPack')}</Typography.Text>
          </div>
        }
        extra={
          <Select
            value={iconPack}
            placeholder={t('selectIconPack')}
            onChange={v => setIconPack(v as any)}
          >
            <Select.Option value="mbe-style">MBE Style</Select.Option>
            <Select.Option value="delta-icons">Delta Icons</Select.Option>
            <Select.Option value="liquid-glass">
              {t('liquidGlass')}
            </Select.Option>
          </Select>
        }
      />
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">
              {t('iconProvider')}
            </Typography.Text>
            <Typography.Text type="quaternary" className="content">
              {t('whenAutoSelected')}
            </Typography.Text>
          </div>
        }
        extra={
          <Select
            value={iconProvider}
            placeholder={t('selectIconProvider')}
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
