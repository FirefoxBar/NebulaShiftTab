import { createContext } from 'react';
import usePref from '@/hooks/use-pref';
import { icons } from '@/share/theme';
import type { PrefValue } from '@/share/types';

interface IconContextValue {
  theme: string;
  activeIconPack?: Record<string, string>;
  defaultIcon?: string;
  iconProvider: PrefValue['iconProvider'];
}

export const SiteIconContext = createContext<IconContextValue>({} as any);

export const useSiteIconContext = (): IconContextValue => {
  const [theme] = usePref('theme');
  const [iconProvider] = usePref('iconProvider');

  const activeIconPack = theme ? icons[theme] : undefined;

  const defaultIcon = activeIconPack
    ? `/theme/${theme}/icons/${activeIconPack._default}`
    : '';

  return {
    iconProvider,
    theme,
    activeIconPack,
    defaultIcon,
  };
};
