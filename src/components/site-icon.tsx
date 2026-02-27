import { useAsyncEffect } from 'ahooks';
import type React from 'react';
import { useContext, useState } from 'react';
import { StorageKey } from '@/share/constant';
import { getLocalStorage } from '@/share/storage';
import type { SiteItem as TSiteItem } from '@/share/types';
import { SiteIconContext } from './site-icon-context';

interface SiteIconProps {
  site: TSiteItem;
}

export const SiteIcon: React.FC<SiteIconProps> = ({ site }) => {
  const { defaultIcon, activePackKey, activePack, iconProvider } =
    useContext(SiteIconContext);
  const [icon, setIcon] = useState('');

  useAsyncEffect(async () => {
    if (['local', 'custom'].includes(site.iconType) && site.icon) {
      setIcon(site.icon);
      return;
    }

    if (site.iconType === 'local') {
      const s = await getLocalStorage(`${StorageKey.siteIcon}_${site.id}`);
      setIcon(s || defaultIcon);
      return;
    }

    const getIconFromPack = () => {
      if (!activePack) {
        return '';
      }

      try {
        const urlObj = new URL(site.url);
        const hostname = urlObj.hostname;

        // 尝试精确匹配完整域名
        if (activePack[hostname]) {
          return `/icons/${activePackKey}/${activePack[hostname]}`;
        }

        // 尝试匹配主域名（去掉子域名）
        const parts = hostname.split('.');
        if (parts.length > 2) {
          let mainDomain = '';
          if (!['com', 'org', 'net', 'edu'].includes(parts[parts.length - 2])) {
            mainDomain = parts.slice(parts.length - 2).join('.');
          } else {
            mainDomain = parts.slice(parts.length - 3).join('.');
          }
          if (activePack[mainDomain]) {
            return `/icons/${activePackKey}/${activePack[mainDomain]}`;
          }
        }
      } catch (_e) {
        console.error('Invalid URL:', site.url);
      }
    };

    if (site.iconType === 'builtin') {
      const res = getIconFromPack();
      setIcon(res || defaultIcon || '');
      return;
    }

    // 如果是auto类型或者内置图标未找到，使用chrome默认的favicon
    if (site.iconType === 'auto') {
      try {
        const urlObj = new URL(site.url);
        switch (iconProvider) {
          case 'google':
            setIcon(
              `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`,
            );
            return;
          case 'duckduckgo':
            setIcon(
              `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico?size=large`,
            );
            return;
          case 'icon.horse':
            setIcon(`https://icon.horse/icon/${urlObj.hostname}`);
            return;
        }
      } catch (_e) {
        console.error('Invalid URL for favicon:', site.url);
      }
    }
  }, [activePackKey, iconProvider, site.url, site.iconType, site.icon]);

  return (
    <img
      src={icon || defaultIcon}
      alt={site.name}
      className="site-icon"
      onError={e => {
        const target = e.target as HTMLImageElement;
        target.src = defaultIcon || '';
      }}
    />
  );
};
