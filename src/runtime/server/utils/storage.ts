import type { Storage } from 'unstorage';
import { prefixStorage } from 'unstorage';
import { isFunction, isString } from '@whoj/utils-core';
import { useNitroApp, useStorage, useRuntimeConfig } from '#imports';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';

export interface BoxTokenStorageData extends AccessToken {

}

export interface BoxTokenStorageOptions {
  /**
   * if provided, will be used as storage prefix
   * @default `ccg` | 'jwt' | 'oauth' - depending on your configuration
   */
  auth?: string;

  /**
   * if provided, will be used to retrieve key for storing the access token
   * Otherwise, it will call NitroRuntimeHook named 'box:token:storageKey'
   */
  getKey?: () => string | Promise<string>;
}

class BoxTokenStorage implements TokenStorage {
  constructor(
    readonly storage: Storage<BoxTokenStorageData>,
    protected readonly config: BoxTokenStorageOptions = {}
  ) {}

  async store(token: AccessToken) {
    await this.storage.setItem(await this.getKey(), token);
    return undefined;
  }

  async get() {
    const key = await this.getKey();
    const data = (await this.storage.getItem(key)) ?? undefined;
    if (!data) return undefined;
    return {
      ...data,
      meta: await this.storage.getMeta(key),
      key
    };
  }

  async clear() {
    await this.storage.clear(await this.getKey());
    return undefined;
  }

  private async getKey() {
    if (isFunction(this.config.getKey)) {
      return this.config.getKey();
    }

    const obj = {
      key: 'access_token',
      auth: this.config.auth
    };

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:token:storageKey', obj);

    return obj.key;
  }
}

export function useBoxTokenStorage(storage: Storage | string = 'cache', options: BoxTokenStorageOptions = {}): TokenStorage {
  const unstorage = !storage || isString(storage)
    ? useStorage(storage ?? 'cache')
    : storage;

  let base = 'box';
  options.auth ||= useRuntimeConfig().public.box.auth;
  if (options.auth?.length) {
    base += `:${options.auth}`;
  }

  const boxStorage = prefixStorage<BoxTokenStorageData>(unstorage, base);

  return new BoxTokenStorage(boxStorage, options);
}
