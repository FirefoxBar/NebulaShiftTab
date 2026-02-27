import { createContext } from 'react';
import usePref from '@/hooks/use-pref';
import { iconPack } from '@/share/icon-pack';
import type { PrefValue } from '@/share/types';

interface IconContextValue {
  activePackKey: string;
  activePack?: Record<string, string>;
  defaultIcon?: string;
  iconProvider: PrefValue['iconProvider'];
}

export const useSiteIconContext = (): IconContextValue => {
  const [activeIconPackKey] = usePref('iconPack');
  const [iconProvider] = usePref('iconProvider');

  const activeIconPack = activeIconPackKey
    ? iconPack[activeIconPackKey]
    : undefined;

  const defaultIcon = activeIconPack
    ? `/icons/${activeIconPackKey}/${activeIconPack._default}`
    : '';

  return {
    iconProvider,
    activePackKey: activeIconPackKey,
    activePack: activeIconPack,
    defaultIcon,
  };
};

export const SiteIconContext = createContext<IconContextValue>({} as any);
