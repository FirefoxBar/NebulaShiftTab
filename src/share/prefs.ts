import isEqual from 'fast-deep-equal';
import { debounce } from 'lodash-es';
import { defaultPrefValue, searchItemShowOnAll } from './constant';
import emitter from './emitter';
import { getSyncStorage } from './storage';
import { SearchItemAlias } from './type-alias';
import type { PrefValue } from './types';

class Prefs {
  private boundMethods: { [key: string]: (value: any) => any } = {};
  private boundWrappers: { [key: string]: any } = {};
  // when browser is strarting up, the setting is default
  private isDefault = true;
  private values: PrefValue;

  constructor() {
    this.values = { ...defaultPrefValue };

    Object.entries(defaultPrefValue).forEach(it => {
      this.set(it[0] as keyof PrefValue, it[1], true);
    });

    getSyncStorage('settings').then(synced => {
      for (const key in defaultPrefValue) {
        if (synced && key in synced) {
          this.set(key as keyof PrefValue, synced[key], true);
        }
      }
      this.isDefault = false;
      emitter.emit(emitter.EVENT_PREFS_READY);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && 'settings' in changes) {
        const synced: any = changes.settings.newValue;
        if (synced) {
          for (const key in defaultPrefValue) {
            if (key in synced) {
              this.set(key as keyof PrefValue, synced[key], true);
            }
          }
        } else {
          // user manually deleted our settings, we'll recreate them
          chrome.storage.sync.set({ settings: this.values });
        }
      }
    });

    // 避免频繁写入导致保存报错
    this.save = debounce(this.save, 300);
  }

  save() {
    this.forceSave();
  }

  forceSave() {
    return chrome.storage.sync.set({
      settings: this.values,
    });
  }

  get<K extends keyof PrefValue>(
    key: K,
    defaultValue?: PrefValue[K],
  ): PrefValue[K] {
    if (key in this.boundMethods) {
      if (key in this.boundWrappers) {
        return this.boundWrappers[key];
      } else if (key in this.values) {
        this.boundWrappers[key] = this.boundMethods[key](this.values[key]);
        return this.boundWrappers[key];
      }
    }
    if (key in this.values) {
      return this.values[key];
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return defaultPrefValue[key];
  }

  getAll() {
    return { ...this.values };
  }

  set<T extends keyof PrefValue>(
    key: T,
    value: PrefValue[T] | undefined,
    noSync = false,
  ) {
    const oldValue = this.values[key as keyof PrefValue];
    if (key === 'searches' && value) {
      (value as PrefValue['searches']).forEach(it => {
        if (typeof it[SearchItemAlias.showOn] === 'undefined') {
          it[SearchItemAlias.showOn] = searchItemShowOnAll;
        }
      });
    }
    if (!isEqual(value, oldValue)) {
      (this.values as any)[key] = value;
      emitter.emit(emitter.EVENT_PREFS_UPDATE, key, value);
      if (!noSync) {
        this.save();
      }
    }
  }

  bindAPI(apiName: string, apiMethod: (value: any) => any) {
    this.boundMethods[apiName] = apiMethod;
  }

  remove(key: keyof PrefValue) {
    this.set(key, undefined);
  }

  ready(cb: () => void) {
    if (!this.isDefault) {
      cb();
    } else {
      emitter.once(emitter.EVENT_PREFS_READY, cb);
    }
  }

  watch(cb: (values: PrefValue) => void) {
    const c = () => {
      cb(this.values);
    };
    emitter.on(emitter.EVENT_PREFS_UPDATE, c);
    return () => {
      emitter.off(emitter.EVENT_PREFS_UPDATE, c);
    };
  }

  watchKey<K extends keyof PrefValue>(
    key: K,
    cb: (value: PrefValue[K]) => void,
  ) {
    const c = (changedKey: keyof PrefValue, value: any) => {
      if (changedKey === key) {
        cb(value);
      }
    };
    emitter.on(emitter.EVENT_PREFS_UPDATE, c);
    return () => {
      emitter.off(emitter.EVENT_PREFS_UPDATE, c);
    };
  }

  getAndWatch<K extends keyof PrefValue>(
    key: K,
    cb: (value: PrefValue[K]) => void,
  ) {
    this.ready(() => cb(this.get(key)));
    return this.watchKey(key, cb);
  }
}

export const prefs = new Prefs();
