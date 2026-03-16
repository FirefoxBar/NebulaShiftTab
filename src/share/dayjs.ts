import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { PluginLunar } from 'dayjs-plugin-lunar';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(PluginLunar);

// 默认使用 en-US
const lang = chrome.i18n.getUILanguage();
const currentLocale = lang === 'zh-CN' ? 'zh-cn' : 'en';

dayjs.locale(currentLocale);

export default dayjs;
