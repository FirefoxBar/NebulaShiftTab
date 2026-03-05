import { nanoid } from 'nanoid';
import Modal from '@/components/modal';
import { StorageKey } from '@/share/constant';
import { t } from '@/share/locale';
import { prefs } from '@/share/prefs';
import { SiteItemAlias } from '@/share/type-alias';
import { SiteItem } from '@/share/types';
import { SiteEditForm } from './site-edit-form';

interface SiteEditModalProps {
  initialData?: SiteItem;
  onSave?: (site: SiteItem, sites: SiteItem[]) => void;
  onCancel?: () => void;
}

export const showSiteEditModal = ({
  initialData,
  onSave,
  onCancel,
}: SiteEditModalProps) => {
  let m: ReturnType<typeof Modal.info>;

  // 保存站点
  const handleSaveSite = (updatedSite: SiteItem) => {
    const sites = prefs.get('sites');
    if (!updatedSite[SiteItemAlias.id]) {
      updatedSite[SiteItemAlias.id] = nanoid();
    }
    const newSites = [...sites];
    const index = newSites.findIndex(
      site => site[SiteItemAlias.id] === updatedSite[SiteItemAlias.id],
    );

    if (index !== -1) {
      newSites[index] = updatedSite;
    } else {
      // 添加新站点
      newSites.push(updatedSite);
    }

    newSites.forEach(site => {
      if (
        ['local', 'custom'].includes(site[SiteItemAlias.iconType]) &&
        site[SiteItemAlias.icon]?.startsWith('data:image/')
      ) {
        chrome.storage.local.set({
          [`${StorageKey.siteIcon}_${site[SiteItemAlias.id]}`]:
            site[SiteItemAlias.icon],
        });
        site[SiteItemAlias.iconType] = 'local';
        delete site[SiteItemAlias.icon];
      }
      if (site[SiteItemAlias.icon] === '') {
        delete site[SiteItemAlias.icon];
      }
    });

    prefs.set('sites', newSites);

    onSave?.(updatedSite, newSites);
    m.destroy();
  };

  const handleCancel = () => {
    onCancel?.();
    m.destroy();
  };

  m = Modal.info({
    title: initialData?.[SiteItemAlias.id] ? t('editSite') : t('addSite'),
    content: (
      <SiteEditForm
        initialData={initialData}
        onSave={handleSaveSite}
        onCancel={handleCancel}
      />
    ),
    footer: null,
    icon: null,
    width: 500,
    maskClosable: false,
    closeOnEsc: false,
  });

  return m;
};
