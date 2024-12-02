import { useBoxAuth } from './auth';
import { BoxClient } from '#nuxt/box-sdk/client';
import { isFunction, isObject } from '@whoj/utils-core';
import { tryUseNuxtApp, useRuntimeConfig } from '#imports';
import { invokeCachedFunction } from '#nuxt/box-sdk/utils';
import type { BoxTokenAuthConfig, BoxTokenAuthOptions } from './auth';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';

export function useBoxClient<T extends Authentication>(auth: T): BoxClient;
export function useBoxClient<T extends TokenStorage>(tokenStorage: T): BoxClient;
export function useBoxClient<T extends string | AccessToken>(token: T, config?: BoxTokenAuthConfig): BoxClient;
export function useBoxClient(...args: any[]): BoxClient {
  return invokeCachedFunction(createBoxClient, ...args);
}

export function createBoxClient(_auth?: string | AccessToken | Authentication | TokenStorage, config?: BoxTokenAuthConfig) {
  let _client: BoxClient;
  if (isObject<Authentication>(_auth) && isFunction(_auth.retrieveToken)) {
    _client = new BoxClient({ auth: _auth });
  }
  else {
    const options: BoxTokenAuthOptions = { config };
    if (_auth) {
      if (isObject<TokenStorage>(_auth) && isFunction(_auth.get)) {
        options.tokenStorage = _auth;
      }
      else {
        options.token = _auth as string | AccessToken;
      }
    }
    else if (import.meta.dev) {
      options.token = useRuntimeConfig().public.box.developer?.token;
    }

    _client = new BoxClient({ auth: useBoxAuth(options) });
  }

  if (import.meta.dev) {
    return _client.withInterceptors([
      {
        beforeRequest(options) {
          if (tryUseNuxtApp()?.$config.public.box.debug) {
            console.log('Box Request: >>>  ', options.url);
          }
          return options;
        },
        afterRequest(response) {
          if (tryUseNuxtApp()?.$config.public.box.debug) {
            console.log('Box Response: >>>  ', response.data);
          }
          return response;
        }
      }
    ]);
  }

  return _client;
}
