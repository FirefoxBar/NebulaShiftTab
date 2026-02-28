import type { PrefValue } from '@/share/types';

export interface BaseBackup {
  version: string;
}
export interface BackupV1 extends BaseBackup {
  version: '1';
  pref: Partial<PrefValue>;
  siteIcons: Record<string, string>;
  bg: string;
}
