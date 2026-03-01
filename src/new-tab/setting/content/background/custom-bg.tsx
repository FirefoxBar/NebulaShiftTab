import { Button, Form, Select, useFieldState } from '@douyinfe/semi-ui';
import { nanoid } from 'nanoid';
import type React from 'react';
import { t } from '@/share/locale';
import { BackgroundItemAlias } from '@/share/type-alias';
import type { BackgroundItem } from '@/share/types';

interface CustomBgProps {
  initialValue?: BackgroundItem;
  onCancel: () => void;
  onSubmit: (values: BackgroundItem) => void;
}

const URLInput = () => {
  const { value: type } = useFieldState(BackgroundItemAlias.type);

  if (!type) {
    return null;
  }

  return (
    <Form.Input
      field={BackgroundItemAlias.url}
      label={t('apiOrImageAddress', type === 'api' ? 'API' : t('image'))}
      rules={[
        { required: true, message: t('pleaseEnterAddressMsg') },
        { type: 'url', message: t('pleaseEnterValidURLMsg') },
      ]}
    />
  );
};

const ExtractInput = () => {
  const { value: type } = useFieldState(BackgroundItemAlias.type);

  if (type !== 'api') {
    return null;
  }

  return (
    <Form.Input
      field={BackgroundItemAlias.extract}
      label={t('extractionExpression')}
      placeholder={t('enterJSONataPath')}
    />
  );
};

export const CustomBg: React.FC<CustomBgProps> = ({
  initialValue,
  onSubmit,
  onCancel,
}) => {
  // 处理自定义背景表单提交
  const handleCustomSubmit = (values: any) => {
    const customBackground: BackgroundItem = {
      [BackgroundItemAlias.key]: nanoid(),
      [BackgroundItemAlias.url]: values.url,
      [BackgroundItemAlias.type]: values.type,
      [BackgroundItemAlias.refresh]: values.refresh,
      [BackgroundItemAlias.extract]: values.extract,
    };

    onSubmit?.(customBackground);
  };

  return (
    <Form
      className="custom-bg-form"
      initValues={
        initialValue
          ? {
              type: initialValue[BackgroundItemAlias.type],
              url: initialValue[BackgroundItemAlias.url],
              refresh: initialValue[BackgroundItemAlias.refresh],
              extract: initialValue[BackgroundItemAlias.extract],
            }
          : {}
      }
      onSubmit={handleCustomSubmit}
      labelPosition="left"
      labelWidth={120}
    >
      <Form.RadioGroup
        field={BackgroundItemAlias.type}
        label={t('type')}
        rules={[{ required: true, message: t('pleaseSelect') }]}
        options={[
          { label: 'API', value: 'api' },
          { label: t('image'), value: 'image' },
        ]}
      />
      <Form.Select
        field={BackgroundItemAlias.refresh}
        label={t('refreshFrequency')}
        placeholder={t('selectRefreshFrequency')}
        rules={[{ required: true, message: t('pleaseSelect') }]}
      >
        <Select.Option value={0}>{t('never')}</Select.Option>
        <Select.Option value="new-day">{t('daily')}</Select.Option>
        <Select.Option value={1}>{t('everyXMinutes', '1')}</Select.Option>
        <Select.Option value={5}>{t('everyXMinutes', '5')}</Select.Option>
        <Select.Option value={10}>{t('everyXMinutes', '10')}</Select.Option>
        <Select.Option value={30}>{t('everyXMinutes', '30')}</Select.Option>
        <Select.Option value={60}>{t('everyXHours', '1')}</Select.Option>
        <Select.Option value={120}>{t('everyXHours', '2')}</Select.Option>
        <Select.Option value={240}>{t('everyXHours', '4')}</Select.Option>
        <Select.Option value={480}>{t('everyXHours', '8')}</Select.Option>
        <Select.Option value={720}>{t('everyXHours', '12')}</Select.Option>
        <Select.Option value={1440}>{t('everyXHours', '24')}</Select.Option>
      </Form.Select>
      <URLInput />
      <ExtractInput />
      <div className="footer">
        <Button type="tertiary" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button
          htmlType="submit"
          type="primary"
          theme="solid"
          style={{ marginRight: 8 }}
        >
          {t('save')}
        </Button>
      </div>
    </Form>
  );
};
