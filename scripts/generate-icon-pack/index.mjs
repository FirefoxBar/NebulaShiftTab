import { readdir, stat, writeFile } from 'fs/promises';
import path from 'path';
import baseMap from './base-map.json' with { type: 'json' };

const __dirname = path
  .dirname(new URL(import.meta.url).pathname)
  .replace('\\', '/')
  .replace(/^\/\w:\//, '/');
const publicIcons = path.join(__dirname, '../../public/icons');
const src = path.join(__dirname, '../../src');
const iconPack = path.join(src, 'share/icon-pack');

async function isDir(path) {
  return (await stat(path)).isDirectory();
}

async function main() {
  const baseList = Object.values(baseMap);

  const iconPackList = await readdir(publicIcons);

  const result = {};

  for (const iconPack of iconPackList) {
    if (!(await isDir(path.join(publicIcons, iconPack)))) {
      continue;
    }

    const iconFileList = await readdir(path.join(publicIcons, iconPack));
    const iconFileMap = Object.fromEntries(
      iconFileList.map(file => [file.replace(/\.(\w+)$/, ''), file]),
    );

    Object.keys(iconFileMap).forEach(key => {
      if (!baseList.includes(key)) {
        console.log(`⚠️ ${iconPack}/${iconFileMap[key]} not in base-map.json`);
      }
    });

    result[iconPack] = Object.fromEntries(
      Object.entries(baseMap)
        .filter(([_, key]) => key in iconFileMap)
        .map(([domain, key]) => [domain, iconFileMap[key]]),
    );
  }

  await writeFile(
    path.join(iconPack, 'list.json'),
    JSON.stringify(result, null, 2),
    'utf8',
  );

  console.log('✅ Done');
}

main();
