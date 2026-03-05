import { Button, Form, Select } from '@douyinfe/semi-ui';
import { t } from '@/share/locale';
import { SearchItemAlias } from '@/share/type-alias';
import type { SearchItem } from '@/share/types';

import './search-edit-form.less';
import { BoolFlagsField } from '@/components/bool-flags-editor';
import { SearchItemShowOnFlag, searchItemShowOnAll } from '@/share/constant';

interface SearchEditFormProps {
  initialData?: SearchItem;
  onSave: (data: SearchItem) => void;
  onCancel: () => void;
}

export const SearchEditForm: React.FC<SearchEditFormProps> = ({
  initialData = {
    [SearchItemAlias.key]: '',
    [SearchItemAlias.name]: '',
    [SearchItemAlias.url]: '',
    [SearchItemAlias.showOn]: searchItemShowOnAll,
    [SearchItemAlias.suggestion]: '',
    [SearchItemAlias.suggestionType]: 'json',
    [SearchItemAlias.extractSuggestion]: '',
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
        field={SearchItemAlias.name}
        label={t('name')}
        placeholder={t('enterSearchEngineName')}
        rules={[{ required: true, message: t('enterSearchEngineName') }]}
      />
      <Form.Input
        field={SearchItemAlias.url}
        label={t('searchUrl')}
        placeholder={t('searchUrlPlaceholder')}
        rules={[
          { required: true, message: t('enterSearchUrl') },
          {
            validator: (_rule: any, value: any) => {
              if (!value.includes('{{q}}')) {
                return new Error(t('searchUrlRequiresPlaceholder'));
              }
              return true;
            },
          },
          {
            transform: x => x.replace('{{q}}', 'test'),
            type: 'url',
            message: t('invalidUrl'),
          },
        ]}
      />
      <BoolFlagsField
        field={SearchItemAlias.showOn}
        label="显示于"
        optionList={[
          { label: '首页', flag: SearchItemShowOnFlag.HOME },
          { label: '右键菜单', flag: SearchItemShowOnFlag.CONTEXT_MENU },
        ]}
      />
      <Form.Input
        field={SearchItemAlias.suggestion}
        label={t('suggestionUrl')}
        placeholder={t('suggestionUrl')}
      />
      <Form.Select
        field={SearchItemAlias.suggestionType}
        label={t('suggestionType')}
        placeholder={t('selectSuggestionType')}
      >
        <Select.Option value="json">{t('json')}</Select.Option>
        <Select.Option value="jsonp">{t('jsonp')}</Select.Option>
      </Form.Select>
      <Form.Input
        field={SearchItemAlias.extractSuggestion}
        label={t('extractionExpression')}
        placeholder={t('enterJSONataPath')}
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
