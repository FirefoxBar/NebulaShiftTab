import { useAsyncEffect } from 'ahooks';
import type React from 'react';
import { useContext, useState } from 'react';
import { StorageKey } from '@/share/constant';
import { getLocalStorage } from '@/share/storage';
import { SiteItemAlias } from '@/share/type-alias';
import type { SiteItem as TSiteItem } from '@/share/types';
import { SiteIconContext } from './site-icon-context';

interface SiteIconProps {
  site: TSiteItem;
}

export const SiteIcon: React.FC<SiteIconProps> = ({ site }) => {
  const { defaultIcon, theme, activeIconPack, iconProvider } =
    useContext(SiteIconContext);
  const [icon, setIcon] = useState('');

  useAsyncEffect(async () => {
    if (
      ['local', 'custom'].includes(site[SiteItemAlias.iconType]) &&
      site[SiteItemAlias.icon]
    ) {
      setIcon(site[SiteItemAlias.icon]!);
      return;
    }

    if (site[SiteItemAlias.iconType] === 'local') {
      const s = await getLocalStorage(
        `${StorageKey.siteIcon}_${site[SiteItemAlias.id]}`,
      );
      setIcon(s || defaultIcon);
      return;
    }

    const getIconFromPack = () => {
      if (!activeIconPack) {
        return '';
      }

      try {
        const urlObj = new URL(site[SiteItemAlias.url]);
        const hostname = urlObj.hostname;

        // 尝试精确匹配完整域名
        if (activeIconPack[hostname]) {
          return `/theme/${theme}/icons/${activeIconPack[hostname]}`;
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
          if (activeIconPack[mainDomain]) {
            return `/theme/${theme}/icons/${activeIconPack[mainDomain]}`;
          }
        }
      } catch (_e) {
        console.error('Invalid URL:', site[SiteItemAlias.url]);
      }
    };

    if (site[SiteItemAlias.iconType] === 'builtin') {
      const res = getIconFromPack();
      setIcon(res || defaultIcon || '');
      return;
    }

    // 如果是auto类型或者内置图标未找到，使用chrome默认的favicon
    if (site[SiteItemAlias.iconType] === 'auto') {
      try {
        const urlObj = new URL(site[SiteItemAlias.url]);
        switch (iconProvider) {
          case 'google':
            setIcon(
              `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`,
            );
            return;
          case 'icon.horse':
            setIcon(`https://icon.horse/icon/${urlObj.hostname}`);
            return;
          case 'favicon.im':
            setIcon(`https://favicon.im/${urlObj.hostname}?larger=true`);
            return;
          case 'toolb':
            setIcon(`https://toolb.cn/favicon/${urlObj.hostname}`);
            return;
          case 'favicon.run':
            setIcon(
              `https://favicon.run/favicon?sz=256&domain=${urlObj.hostname}`,
            );
            return;
          case 'duckduckgo':
          default:
            setIcon(
              `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico?size=large`,
            );
            return;
        }
      } catch (_e) {
        console.error('Invalid URL for favicon:', site[SiteItemAlias.url]);
      }
    }
  }, [
    activeIconPack,
    iconProvider,
    site[SiteItemAlias.url],
    site[SiteItemAlias.iconType],
    site[SiteItemAlias.icon],
  ]);

  return (
    <img
      src={icon || defaultIcon}
      alt={site[SiteItemAlias.name]}
      className="site-icon"
      onError={e => {
        const target = e.target as HTMLImageElement;
        target.src = defaultIcon || '';
      }}
    />
  );
};
