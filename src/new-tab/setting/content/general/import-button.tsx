import { Button } from '@douyinfe/semi-ui';
import Modal from '@/components/modal';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import type { PrefValue } from '@/share/types';
import { BackupV1, BaseBackup } from './types';

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
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
  });
}
export const ImportButton = () => {
  return <Button onClick={doImport}>{t('restoreFromFile')}</Button>;
};
