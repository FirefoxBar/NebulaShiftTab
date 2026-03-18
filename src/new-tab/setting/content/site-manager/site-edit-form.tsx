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
import { useDebounceFn } from 'ahooks';
import { SiteIcon } from '@/components/site-icon';
import {
  SiteIconContext,
  useSiteIconContext,
} from '@/components/site-icon-context';
import { t } from '@/share/locale';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem } from '@/share/types';

import './site-edit-form.less';

interface SiteEditFormProps {
  initialData?: SiteItem;
  onSave: (data: SiteItem) => void;
  onCancel: () => void;
}

const IconField = () => {
  const iconContext = useSiteIconContext();
  const formApi = useFormApi();
  const { value: iconType } = useFieldState(SiteItemAlias.iconType);
  const { values } = useFormState();

  // console.log(values);

  return (
    <div className="form-icon">
      <div>
        <Form.Slot label={t('iconType')}>
          <Select
            placeholder={t('selectIconType')}
            value={iconType}
            onChange={v =>
              formApi.setValue(SiteItemAlias.iconType, v as string)
            }
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
            field={SiteItemAlias.icon}
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
                  formApi.setValue(SiteItemAlias.icon, base64String);
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

const URLField = () => {
  const formApi = useFormApi();

  const { run, flush } = useDebounceFn(
    () => {
      const act = async () => {
        const url = formApi.getValue(SiteItemAlias.url);
        if (
          formApi.getValue(SiteItemAlias.name) ||
          !url ||
          !/^https?:\/\//.test(url)
        ) {
          return;
        }
        // fetch url 并解析 html title
        const resp = await fetch(url);
        const html = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const title = doc.title;
        if (title && !formApi.getValue(SiteItemAlias.name)) {
          formApi.setValue(SiteItemAlias.name, title);
        }
      };
      setTimeout(act, 200);
    },
    {
      wait: 1500,
    },
  );

  return (
    <Form.Input
      field={SiteItemAlias.url}
      label={t('url')}
      placeholder={t('enterSiteUrl')}
      rules={[
        { required: true, message: t('enterSiteUrl') },
        { type: 'url', message: t('invalidUrl') },
      ]}
      onPaste={flush}
      onBlur={flush}
      onChange={run}
    />
  );
};

export const SiteEditForm: React.FC<SiteEditFormProps> = ({
  initialData = {
    [SiteItemAlias.id]: '',
    [SiteItemAlias.name]: '',
    [SiteItemAlias.url]: '',
    [SiteItemAlias.iconType]: 'builtin',
    [SiteItemAlias.icon]: '',
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
        field={SiteItemAlias.name}
        label={t('name')}
        placeholder={t('enterSiteName')}
        rules={[{ required: true, message: t('enterSiteName') }]}
      />

      <URLField />

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
