import icon from './icon.json' with { type: 'json' };
import info from './info.json' with { type: 'json' };

export const icons: Record<string, Record<string, string>> = icon;

interface ThemeInfo {
  css: boolean;
}
export const themeInfo: Record<string, ThemeInfo> = info;
