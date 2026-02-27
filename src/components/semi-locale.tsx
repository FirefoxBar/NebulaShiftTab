import { LocaleProvider } from '@douyinfe/semi-ui';

const allLocales: any = {};

// @ts-expect-error
const context = require.context(
  `${SEMI_ROOT}/lib/es/locale/source`,
  false,
  /\.js$/,
);
context.keys().forEach((key: string) => {
  const locale = context(key);
  if (locale.default) {
    const name = locale.default.code;
    if (typeof allLocales[name] === 'undefined') {
      allLocales[name] = locale.default;
    }
  }
});

// 默认使用 en-US
const lang = chrome.i18n.getUILanguage();
const currentLocale =
  typeof allLocales[lang] === 'object' ? allLocales[lang] : allLocales['en-US'];

const SemiLocale = (props: any) => (
  <LocaleProvider locale={currentLocale}>{props.children}</LocaleProvider>
);

export { currentLocale };
export default SemiLocale;
