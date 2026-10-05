import { List, Toast, Typography } from '@douyinfe/semi-ui';
import { withErrorBoundary } from '@/components/error-boundary';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { getLocalStorage } from '@/share/storage';
import { SiteItemAlias } from '@/share/type-alias';
import {
  isSiteDirItem,
  isSiteItem,
  type PrefValue,
  type SiteNode,
} from '@/share/types';
import type { BackupV1, BaseBackup } from '../general/types';
import { ImportAndExportContext } from './context';
import GoogleDrive from './google-drive';
import LocalFile from './local-file';
import OneDrive from './onedrive';
import WebDAV from './webdav';
import Yandex from './yandex';

const getExportContent = async () => {
  const pref = prefs.getAll();

  const getIconKeys = (x: SiteNode): string[] => {
    if (isSiteItem(x)) {
      if (x[SiteItemAlias.iconType] === 'local') {
        return [`${StorageKey.siteIcon}_${x[SiteItemAlias.id]}`];
      } else {
        return [];
      }
    }
    if (isSiteDirItem(x)) {
      return x[SiteItemAlias.children].flatMap(child => getIconKeys(child));
    }
    return [];
  };

  const backup: BackupV1 = {
    version: '1',
    pref,
    bg: '',
    siteIcons: await chrome.storage.local.get(pref.sites.flatMap(getIconKeys)),
  };

  if (pref.background.type === 'image') {
    const b = await getLocalStorage(StorageKey.bg);
    if (b) {
      backup.bg = b;
    }
  }

  return backup;
};

const startImport = async (json: BaseBackup) => {
  if (json.version === '1') {
    const v1 = json as BackupV1;
    Object.keys(v1.pref).forEach(key => {
      prefs.set(key as keyof PrefValue, v1.pref[key as keyof PrefValue]);
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
    return;
  }
  Toast.error(t('invalidBackupFile'));
};

const Backup = () => {
  const list = [
    {
      label: t('localFile'),
      Component: LocalFile,
    },
    {
      label: 'WebDAV',
      Component: WebDAV,
    },
    {
      label: 'OneDrive',
      Component: OneDrive,
    },
    {
      label: 'Google Drive',
      Component: GoogleDrive,
    },
    {
      label: 'Yandex',
      Component: Yandex,
    },
  ];
  return (
    <section className="section-backup">
      <ImportAndExportContext.Provider
        value={{ startImport, getExportContent }}
      >
        <List
          className="setting-list"
          dataSource={list}
          renderItem={({ label, Component }) => (
            <List.Item
              key={label}
              main={
                <div className="list-item">
                  <Typography.Text className="title">{label}</Typography.Text>
                </div>
              }
              extra={<Component />}
            />
          )}
        />
      </ImportAndExportContext.Provider>
    </section>
  );
};

export default withErrorBoundary(Backup);
