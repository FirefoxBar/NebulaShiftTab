import { Button } from '@douyinfe/semi-ui';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { getLocalStorage } from '@/share/storage';
import type { BackupV1 } from './types';

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

export const ExportButton = () => {
  return <Button onClick={createExport}>{t('backupToFile')}</Button>;
};
