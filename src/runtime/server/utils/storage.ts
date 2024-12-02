import { prefixStorage } from 'unstorage';
import type { Storage } from 'unstorage';
import { useNitroApp, useStorage } from '#imports';
import { isString, isFunction } from '@whoj/utils-core';
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
  ) {
    if (this.config.auth?.length) {
      this.storage = prefixStorage(storage, this.config.auth);
    }
  }

  async store(token: AccessToken) {
    await this.storage.setItem(await this.getKey(), token);
    return undefined;
  }

  async get() {
    return (await this.storage.getItem(await this.getKey())) ?? undefined;
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

export function useBoxTokenStorage(storage?: string | Storage, options?: BoxTokenStorageOptions): TokenStorage {
  storage = !storage || isString(storage)
    ? useStorage(storage)
    : storage;

  const boxStorage = prefixStorage<BoxTokenStorageData>(storage, 'box');

  return new BoxTokenStorage(boxStorage, options);
}
