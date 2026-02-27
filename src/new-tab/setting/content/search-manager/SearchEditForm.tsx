import { Button, Form, Select } from '@douyinfe/semi-ui';
import type { SearchItem } from '@/share/types';

import './SearchEditForm.less';

interface SearchEditFormProps {
  initialData?: SearchItem;
  onSave: (data: SearchItem) => void;
  onCancel: () => void;
}

export const SearchEditForm: React.FC<SearchEditFormProps> = ({
  initialData = {
    key: '',
    name: '',
    url: '',
    suggestion: '',
    suggestionType: 'json',
    extractSuggestion: '',
  } as SearchItem,
  onSave,
  onCancel,
}) => {
  return (
    <Form
      initValues={initialData}
      onSubmit={values => {
        const updatedSearch = { ...initialData, ...values };
        onSave(updatedSearch);
      }}
      className="search-edit-form"
    >
      <Form.Input
        field="name"
        label="名称"
        placeholder="请输入搜索引擎名称"
        rules={[{ required: true, message: '请输入搜索引擎名称' }]}
      />
      <Form.Input
        field="url"
        label="搜索地址"
        placeholder="输入搜索地址，使用 {{q}} 表示关键词占位符"
        rules={[
          { required: true, message: '请输入搜索地址' },
          {
            validator: (_rule: any, value: any) => {
              if (!value.includes('{{q}}')) {
                return new Error('搜索地址必须包含 {{q}} 关键词占位符');
              }
              const urlPattern =
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
              if (
                !value.replace('{k}', 'test') ||
                urlPattern.test(value.replace('{k}', 'test'))
              ) {
                return true;
              } else {
                return new Error('请输入有效的网址');
              }
            },
          },
        ]}
      />
      <Form.Input
        field="suggestion"
        label="建议地址"
        placeholder="请输入搜索建议地址（可选）"
      />
      <Form.Select
        field="suggestionType"
        label="建议类型"
        placeholder="请选择建议类型（可选）"
      >
        <Select.Option value="json">JSON</Select.Option>
        <Select.Option value="jsonp">JSONP</Select.Option>
      </Form.Select>
      <Form.Input
        field="extractSuggestion"
        label="提取路径（使用 JSONata 表达式）"
        placeholder="请输入提取搜索建议的路径"
      />

      <div className="footer">
        <Button onClick={onCancel} type="tertiary">
          取消
        </Button>
        <Button htmlType="submit" type="primary" theme="solid">
          保存
        </Button>
      </div>
    </Form>
  );
};
