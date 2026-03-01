import { List, Select, Typography } from '@douyinfe/semi-ui';
import type React from 'react';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { ExportButton } from './export-button';
import { ImportButton } from './import-button';

export const GeneralSettings: React.FC = () => {
  const [darkMode, setDarkMode] = usePref('darkMode');
  const [theme, setTheme] = usePref('theme');
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
            <Typography.Text className="title">{t('theme')}</Typography.Text>
          </div>
        }
        extra={
          <Select
            value={theme}
            placeholder={t('selectIconPack')}
            onChange={v => setTheme(v as any)}
            optionList={[
              { label: 'Default', value: 'default' },
              { label: 'MBE Style', value: 'mbe-style' },
              { label: 'Delta Icons', value: 'delta-icons' },
              { label: 'Liquid Glass', value: 'liquid-glass' },
            ]}
          />
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
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">
              {t('backupToFile')}
            </Typography.Text>
          </div>
        }
        extra={<ExportButton />}
      />
      <List.Item
        main={
          <div className="list-item">
            <Typography.Text className="title">
              {t('restoreFromFile')}
            </Typography.Text>
          </div>
        }
        extra={<ImportButton />}
      />
    </List>
  );
};
