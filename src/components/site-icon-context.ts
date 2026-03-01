import { createContext } from 'react';
import usePref from '@/hooks/use-pref';
import { icons } from '@/share/theme';
import type { PrefValue } from '@/share/types';

interface IconContextValue {
  activePackKey: string;
  activePack?: Record<string, string>;
  defaultIcon?: string;
  iconProvider: PrefValue['iconProvider'];
}

export const useSiteIconContext = (): IconContextValue => {
  const [themeKey] = usePref('theme');
  const [iconProvider] = usePref('iconProvider');

  const activeIconPack = themeKey ? icons[themeKey] : undefined;

  const defaultIcon = activeIconPack
    ? `/icons/${themeKey}/${activeIconPack._default}`
    : '';

  return {
    iconProvider,
    activePackKey: themeKey,
    activePack: activeIconPack,
    defaultIcon,
  };
};

export const SiteIconContext = createContext<IconContextValue>({} as any);
