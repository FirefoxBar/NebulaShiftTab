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
import { t } from '@/share/locale';
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
        <Form.Slot label={t('iconType')}>
          <Select
            placeholder={t('selectIconType')}
            value={iconType}
            onChange={v => formApi.setValue('iconType', v as string)}
          >
            <Select.Option value="builtin">{t('builtinIcon')}</Select.Option>
            <Select.Option value="auto">{t('autoFetch')}</Select.Option>
            <Select.Option value="local">{t('localIcon')}</Select.Option>
            <Select.Option value="custom">{t('custom')}</Select.Option>
          </Select>
        </Form.Slot>

        {iconType === 'custom' && (
          <Form.Input
            label={t('customIconUrl')}
            field="icon"
            rules={[
              { required: true, message: t('enterUrl') },
              { type: 'url', message: t('validUrlRequired') },
            ]}
          />
        )}

        {iconType === 'local' && (
          <Form.Slot label={t('selectIcon')}>
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
                {t('selectImageFile')}
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
        label={t('name')}
        placeholder={t('enterSiteName')}
        rules={[{ required: true, message: t('enterSiteName') }]}
      />
      <Form.Input
        field="url"
        label={t('url')}
        placeholder={t('enterSiteUrl')}
        rules={[
          { required: true, message: t('enterSiteUrl') },
          {
            validator: (_rule: any, value: any) => {
              const urlPattern =
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
              if (!value || urlPattern.test(value)) {
                return true;
              } else {
                return new Error(t('invalidUrl'));
              }
            },
          },
        ]}
      />

      <IconField />

      <div className="footer">
        <Button onClick={onCancel} type="tertiary">
          {t('cancel')}
        </Button>
        <Button htmlType="submit" type="primary" theme="solid">
          {t('save')}
        </Button>
      </div>
    </Form>
  );
};
