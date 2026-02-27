import { IconUpload } from '@douyinfe/semi-icons';
import {
  Button,
  Form,
  Select,
  Upload,
  useFieldState,
  useFormApi,
  useFormState,
} from '@douyinfe/semi-ui';
import { SiteIcon } from '@/components/site-icon';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import type { SiteItem } from '@/share/types';

import './SiteEditForm.less';

interface SiteEditFormProps {
  initialData?: SiteItem;
  onSave: (data: SiteItem) => void;
  onCancel: () => void;
}

const IconField = () => {
  const iconContext = useSiteIconContext();
  const formApi = useFormApi();
  const { value: iconType } = useFieldState('iconType');
  const { values } = useFormState();

  // console.log(values);

  return (
    <div className="form-icon">
      <div>
        <Form.Slot label="图标类型">
          <Select
            placeholder="请选择图标类型"
            value={iconType}
            onChange={v => formApi.setValue('iconType', v as string)}
          >
            <Select.Option value="builtin">内置图标</Select.Option>
            <Select.Option value="auto">自动获取</Select.Option>
            <Select.Option value="local">本地图标</Select.Option>
            <Select.Option value="custom">自定义</Select.Option>
          </Select>
        </Form.Slot>

        {iconType === 'custom' && (
          <Form.Input
            label="自定义图标地址"
            field="icon"
            rules={[
              { required: true, message: '请输入地址' },
              { type: 'url', message: '请输入有效的URL' },
            ]}
          />
        )}

        {iconType === 'local' && (
          <Form.Slot label="选择图标">
            <Upload
              showUploadList={false}
              accept="image/*"
              customRequest={({ file, onSuccess }) => {
                const reader = new FileReader();
                reader.onload = e => {
                  const base64String = e.target?.result as string;
                  formApi.setValue('icon', base64String);
                  onSuccess(null);
                };
                reader.readAsDataURL(file.fileInstance!);
              }}
              action=""
            >
              <Button icon={<IconUpload />} theme="light">
                选择图片文件
              </Button>
            </Upload>
          </Form.Slot>
        )}
      </div>
      <SiteIconContext.Provider value={iconContext}>
        <SiteIcon site={values as SiteItem} />
      </SiteIconContext.Provider>
    </div>
  );
};

export const SiteEditForm: React.FC<SiteEditFormProps> = ({
  initialData = {
    id: '',
    name: '',
    url: '',
    iconType: 'builtin',
    icon: '',
  } as SiteItem,
  onSave,
  onCancel,
}) => {
  return (
    <Form
      initValues={initialData}
      onSubmit={values => {
        const updatedSite = { ...initialData, ...values };
        onSave(updatedSite);
      }}
      className="site-edit-form"
    >
      <Form.Input
        field="name"
        label="名称"
        placeholder="请输入站点名称"
        rules={[{ required: true, message: '请输入站点名称' }]}
      />
      <Form.Input
        field="url"
        label="网址"
        placeholder="请输入站点网址"
        rules={[
          { required: true, message: '请输入站点网址' },
          {
            validator: (_rule: any, value: any) => {
              const urlPattern =
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
              if (!value || urlPattern.test(value)) {
                return true;
              } else {
                return new Error('请输入有效的网址');
              }
            },
          },
        ]}
      />

      <IconField />

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
