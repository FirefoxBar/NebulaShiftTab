import { Button, Form, Select } from '@douyinfe/semi-ui';
import { t } from '@/share/locale';
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
        label={t('name')}
        placeholder={t('enterSearchEngineName')}
        rules={[{ required: true, message: t('enterSearchEngineName') }]}
      />
      <Form.Input
        field="url"
        label={t('searchUrl')}
        placeholder={t('searchUrlPlaceholder')}
        rules={[
          { required: true, message: t('enterSearchUrl') },
          {
            validator: (_rule: any, value: any) => {
              if (!value.includes('{{q}}')) {
                return new Error(t('searchUrlRequiresPlaceholder'));
              }
              const urlPattern =
                /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
              if (
                !value.replace('{k}', 'test') ||
                urlPattern.test(value.replace('{k}', 'test'))
              ) {
                return true;
              } else {
                return new Error(t('invalidUrl'));
              }
            },
          },
        ]}
      />
      <Form.Input
        field="suggestion"
        label={t('suggestionUrl')}
        placeholder={t('suggestionUrl')}
      />
      <Form.Select
        field="suggestionType"
        label={t('suggestionType')}
        placeholder={t('selectSuggestionType')}
      >
        <Select.Option value="json">{t('json')}</Select.Option>
        <Select.Option value="jsonp">{t('jsonp')}</Select.Option>
      </Form.Select>
      <Form.Input
        field="extractSuggestion"
        label={t('extractionPath')}
        placeholder={t('enterExtractionPath')}
      />

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
