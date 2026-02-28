import { Button, Space } from '@douyinfe/semi-ui';
import { omit, pick } from 'lodash-es';
import Modal from '@/components/modal';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { getLocalStorage } from '@/share/storage';
import type { PrefValue } from '@/share/types';

interface BaseBackup {
  version: string;
}
interface BackupV1 extends BaseBackup {
  version: '1';
  pref: Partial<PrefValue>;
  siteIcons: Record<string, string>;
  bg: string;
}

async function createExport() {
  const pref = prefs.getAll();

  const backup: BackupV1 = {
    version: '1',
    pref,
    bg: '',
    siteIcons: await chrome.storage.local.get(
      pref.sites
        .filter(x => x.iconType === 'local')
        .map(x => `${StorageKey.siteIcon}_${x.id}`),
    ),
  };

  if (pref.background.type === 'image') {
    const b = await getLocalStorage(StorageKey.bg);
    if (b) {
      backup.bg = b;
    }
  }

  const res = JSON.stringify(backup, null, 2);

  const file = new Blob([res], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  const time = new Date().toLocaleString().replace(/[^0-9]/g, '-');
  a.download = `nebula-shift-tab-${time}.json`;
  a.click();
}

async function doImport() {
  Modal.warning({
    title: t('importBackup'),
    content: t('importWillOverrideSettings'),
    okText: t('continueImport'),
    onOk: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async e => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
          const json: BaseBackup = JSON.parse(reader.result as string);
          if (json.version === '1') {
            const v1 = json as BackupV1;
            Object.keys(v1.pref).forEach(key => {
              prefs.set(
                key as keyof PrefValue,
                v1.pref[key as keyof PrefValue],
              );
            });
            await prefs.forceSave();
            if (v1.bg) {
              await chrome.storage.local.set({
                [StorageKey.bg]: v1.bg,
              });
            }
            await chrome.storage.local.set(v1.siteIcons);
            window.location.reload();
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
  });
}
export const ExportAndImport = () => {
  return (
    <div className="export-import">
      <Space>
        <Button onClick={createExport}>{t('backupToFile')}</Button>
        <Button onClick={doImport}>{t('restoreFromFile')}</Button>
      </Space>
    </div>
  );
};
