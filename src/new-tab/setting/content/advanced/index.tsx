import { Button, List, TextArea, Typography } from '@douyinfe/semi-ui';
import { withErrorBoundary } from '@/components/error-boundary';
import Modal from '@/components/modal';
import usePref from '@/hooks/use-pref';
import { t } from '@/share/locale';

const CustomCSS = withErrorBoundary(() => {
  const [css, setCSS] = usePref('customCSS');

  return (
    <Button
      onClick={() => {
        let input = css;
        Modal.info({
          title: t('customCSS'),
          icon: null,
          content: (
            <TextArea
              defaultValue={input}
              onChange={v => (input = v)}
              rows={15}
            />
          ),
          okText: t('save'),
          onOk: () => setCSS(input),
        });
      }}
    >
      {t('edit')}
    </Button>
  );
});

export const Advanced = withErrorBoundary(() => {
  return (
    <div className="advanced-setting">
      <List className="setting-list">
        <List.Item
          main={
            <div className="list-item">
              <Typography.Text className="title">
                {t('customCSS')}
              </Typography.Text>
            </div>
          }
          extra={<CustomCSS />}
        />
      </List>
    </div>
  );
});
