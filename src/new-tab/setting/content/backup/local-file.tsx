import { IconFolderOpen, IconSave } from '@douyinfe/semi-icons';
import { Button, Space, Toast } from '@douyinfe/semi-ui';
import { withErrorBoundary } from '@/components/error-boundary';
import Modal from '@/components/modal';
import { load, save } from '@/share/file';
import { t } from '@/share/locale';
import { useImportAndExportContext } from './context';
import { getExportName } from './utils';

const LocalFile = () => {
  const { startImport, getExportContent } = useImportAndExportContext();

  const handleImport = () => {
    Modal.warning({
      title: t('importBackup'),
      content: t('importWillOverrideSettings'),
      okText: t('continueImport'),
      onOk: () => {
        load('.json').then(content => {
          try {
            startImport(JSON.parse(content));
          } catch (e) {
            Toast.error((e as Error).message);
          }
        });
      },
    });
  };

  const handleExport = async () => {
    save(JSON.stringify(await getExportContent(), null, '\t'), getExportName());
  };

  return (
    <Space>
      <Button onClick={handleExport} icon={<IconSave />}>
        {t('backupToFile')}
      </Button>
      <Button onClick={handleImport} icon={<IconFolderOpen />}>
        {t('restoreFromFile')}
      </Button>
    </Space>
  );
};

export default withErrorBoundary(LocalFile);
