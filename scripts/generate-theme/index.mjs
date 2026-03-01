import { readdir, stat, writeFile } from 'fs/promises';
import path from 'path';
import iconMap from './icon-map.json' with { type: 'json' };

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace('\\', '/')
  .replace(/^\/\w:\//, '/');
const root = path.join(__dirname, '../..');
const themes = path.join(root, 'public/theme');
const src = path.join(root, 'src');
const iconFile = path.join(src, 'share/theme/icon.json');

async function isDir(path) {
  return (await stat(path)).isDirectory();
}

async function main() {
  const baseList = Object.values(iconMap);

  const themeList = await readdir(themes);

  const result = {};

  for (const theme of themeList) {
    if (!(await isDir(path.join(themes, theme)))) {
      continue;
    }

    const iconFileList = await readdir(path.join(themes, theme, 'icons'));
    const iconFileMap = Object.fromEntries(
      iconFileList.map(file => [file.replace(/\.(\w+)$/, ''), file]),
    );

    Object.keys(iconFileMap).forEach(key => {
      if (!baseList.includes(key)) {
        console.log(`⚠️ ${theme}/${iconFileMap[key]} not in icon-map.json`);
      }
    });

    result[theme] = Object.fromEntries(
      Object.entries(iconMap)
        .filter(([_, key]) => key in iconFileMap)
        .map(([domain, key]) => [domain, iconFileMap[key]]),
    );
  }

  await writeFile(iconFile, JSON.stringify(result, null, 2), 'utf8');

  console.log('✅ Done');
}

main();
