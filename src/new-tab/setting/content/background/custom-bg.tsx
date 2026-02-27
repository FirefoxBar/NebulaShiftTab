import { Button, Form, Select, useFieldState } from '@douyinfe/semi-ui';
import { nanoid } from 'nanoid';
import React from 'react';
import type { BackgroundItem } from '@/share/types';

interface CustomBgProps {
  initialValue?: BackgroundItem;
  onCancel: () => void;
  onSubmit: (values: BackgroundItem) => void;
}

const URLInput = () => {
  const { value: type } = useFieldState('type');

  if (!type) {
    return null;
  }

  return (
    <Form.Input
      field="url"
      label={`${type === 'api' ? 'API' : '图片'}地址`}
      rules={[
        { required: true, message: '请输入地址' },
        { type: 'url', message: '请输入有效的URL' },
      ]}
    />
  );
};

const ExtractInput = () => {
  const { value: type } = useFieldState('type');

  if (type !== 'api') {
    return null;
  }

  return (
    <Form.Input
      field="extract"
      label="提取表达式"
      placeholder="输入 JSONAta 路径表达式"
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
      key: nanoid(),
      name: '',
      url: values.url,
      type: values.type,
      refresh: values.refresh,
      extract: values.extract,
    };

    onSubmit?.(customBackground);
  };

  return (
    <Form
      className="custom-bg-form"
      initValues={
        initialValue
          ? {
              type: initialValue.type,
              url: initialValue.url,
              refresh: initialValue.refresh,
              extract: initialValue.extract,
            }
          : {}
      }
      onSubmit={handleCustomSubmit}
      labelPosition="left"
      labelWidth={120}
    >
      <Form.RadioGroup
        field="type"
        label="类型"
        rules={[{ required: true, message: '请选择' }]}
        options={[
          { label: 'API', value: 'api' },
          { label: '图片', value: 'image' },
        ]}
      />
      <Form.Select
        field="refresh"
        label="刷新频率"
        placeholder="选择刷新频率"
        rules={[{ required: true, message: '请选择刷新频率' }]}
      >
        <Select.Option value={0}>从不</Select.Option>
        <Select.Option value="new-day">每天</Select.Option>
        <Select.Option value={1}>每1分钟</Select.Option>
        <Select.Option value={5}>每5分钟</Select.Option>
        <Select.Option value={10}>每10分钟</Select.Option>
        <Select.Option value={30}>每30分钟</Select.Option>
        <Select.Option value={60}>每小时</Select.Option>
        <Select.Option value={120}>每2小时</Select.Option>
        <Select.Option value={240}>每4小时</Select.Option>
        <Select.Option value={480}>每8小时</Select.Option>
        <Select.Option value={720}>每12小时</Select.Option>
        <Select.Option value={1440}>每24小时</Select.Option>
      </Form.Select>
      <URLInput />
      <ExtractInput />
      <div className="footer">
        <Button type="tertiary" onClick={onCancel}>
          取消
        </Button>
        <Button
          htmlType="submit"
          type="primary"
          theme="solid"
          style={{ marginRight: 8 }}
        >
          保存
        </Button>
      </div>
    </Form>
  );
};
