import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Nebula Shift Tab',
  logoText: 'Nebula Shift Tab',
  icon: 'https://img13.360buyimg.com/ddimg/jfs/t1/395422/31/16634/2864/69a2b837F27210681/001508007ac4dd44.jpg',
  logo: {
    light:
      'https://img13.360buyimg.com/ddimg/jfs/t1/395422/31/16634/2864/69a2b837F27210681/001508007ac4dd44.jpg',
    dark: 'https://img13.360buyimg.com/ddimg/jfs/t1/395422/31/16634/2864/69a2b837F27210681/001508007ac4dd44.jpg',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/FirefoxBar/NebulaShiftTab',
      },
    ],
  },
  lang: 'zh-CN',
  locales: [
    {
      lang: 'zh-CN',
      label: '简体中文',
    },
    {
      lang: 'en-US',
      label: 'English',
    },
  ],
});
