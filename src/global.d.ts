declare module '*.less';
declare module '*.css';

declare const SEMI_ROOT: string;
declare const IS_FIREFOX: boolean;
declare const IS_CHROME: boolean;

declare interface Window {
  IS_BACKGROUND?: boolean;
  browser: any;
}
