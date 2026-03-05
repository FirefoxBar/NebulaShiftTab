import { BackgroundItemAlias } from '../type-alias';
import { BackgroundItem } from '../types';

export const backgroundEngines: BackgroundItem[] = [
  {
    [BackgroundItemAlias.key]: 'bing',
    [BackgroundItemAlias.name]: 'Bing',
    [BackgroundItemAlias.url]:
      'https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN',
    [BackgroundItemAlias.type]: 'api',
    [BackgroundItemAlias.refresh]: 'new-day',
    [BackgroundItemAlias.extract]:
      '"https://cn.bing.com" & $.images[0].urlbase & "_1920x1080.jpg"',
  },
  {
    [BackgroundItemAlias.key]: 'spotlight',
    [BackgroundItemAlias.name]: 'Spotlight',
    [BackgroundItemAlias.url]:
      'https://fd.api.iris.microsoft.com/v4/api/selection?placement=88000820&bcnt=4&country=CN&locale=zh-CN&fmt=json',
    [BackgroundItemAlias.type]: 'api',
    [BackgroundItemAlias.refresh]: 'new-day',
    [BackgroundItemAlias.extract]:
      '$json_decode($array_rand($.batchrsp.items).item).ad.landscapeImage.asset',
  },
];
