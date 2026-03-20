import { IconExternalOpen } from '@douyinfe/semi-icons';
import { Button, Input, List, Select, Typography } from '@douyinfe/semi-ui';
import type React from 'react';
import { withErrorBoundary } from '@/components/error-boundary';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';
import { ExportButton } from './export-button';
import { ImportButton } from './import-button';

export const GeneralSettings = withErrorBoundary(() => {
  const [darkMode, setDarkMode] = usePref('darkMode');
  const [theme, setTheme] = usePref('theme');
  const [timeFormat, setTimeFormat] = usePref('timeFormat');
  const [dateFormat, setDateFormat] = usePref('dateFormat');
  const [iconProvider, setIconProvider] = usePref('iconProvider');

  const list = [
    {
      label: t('timeFormat'),
      content: <Input value={timeFormat} onChange={setTimeFormat} />,
    },
    {
      label: t('dateFormat'),
      content: <Input value={dateFormat} onChange={setDateFormat} />,
    },
    {
      label: t('darkMode'),
      content: (
        <Select
          value={darkMode}
          placeholder={t('selectDarkMode')}
          onChange={v => setDarkMode(v as any)}
        >
          <Select.Option value="auto">{t('followSystem')}</Select.Option>
          <Select.Option value="on">{t('on')}</Select.Option>
          <Select.Option value="off">{t('off')}</Select.Option>
        </Select>
      ),
    },
    {
      label: t('theme'),
      content: (
        <Select
          value={theme}
          placeholder={t('selectIconPack')}
          onChange={v => setTheme(v as any)}
          optionList={[
            { label: 'Default', value: 'default' },
            { label: 'Liquid Glass', value: 'liquid-glass' },
            { label: 'MBE Style', value: 'mbe-style' },
            { label: 'Delta Icons', value: 'delta-icons' },
          ]}
        />
      ),
    },
    {
      label: t('iconProvider'),
      help: t('whenAutoSelected'),
      content: (
        <Select
          value={iconProvider}
          placeholder={t('selectIconProvider')}
          onChange={v => setIconProvider(v as any)}
          optionList={[
            { label: 'Google', value: 'google' },
            { label: 'DuckDuckGo', value: 'duckduckgo' },
            { label: 'ToolB', value: 'toolb' },
            { label: 'icon.horse', value: 'icon.horse' },
            { label: 'Favicon.im', value: 'favicon.im' },
            { label: 'favicon.run', value: 'favicon.run' },
            { label: 'Browser', value: 'builtin', disabled: !IS_CHROME },
          ]}
        />
      ),
    },
    {
      label: t('backupToFile'),
      content: <ExportButton />,
    },
    {
      label: t('restoreFromFile'),
      content: <ImportButton />,
    },
    {
      label: t('viewHelp'),
      content: (
        <a href={t('helpUrl')} target="_blank">
          <Button icon={<IconExternalOpen />}>{t('viewHelp')}</Button>
        </a>
      ),
    },
  ];

  return (
    <List
      className="setting-list"
      dataSource={list}
      renderItem={({ label, help, content }) => (
        <List.Item
          key={label}
          main={
            <div className="list-item">
              <Typography.Text className="title">{label}</Typography.Text>
              {help && (
                <Typography.Text type="quaternary" className="content">
                  {help}
                </Typography.Text>
              )}
            </div>
          }
          extra={content}
        />
      )}
    />
  );
});
