import { useRuntimeConfig } from '#imports';
import { ensureSuffix } from '@whoj/utils-core';
import { BoxClient } from '#nuxt/box-sdk/client';
import { BoxTokenAuth, useBoxAuth } from './auth';
import type { BoxTokenAuthConfig, BoxTokenAuthOptions } from './auth';
import { createCachedFunction, isAuthentication, isTokenStorage } from '#nuxt/box-sdk/utils';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';

export function useBoxClient<T extends Authentication>(auth?: T): BoxClient;
export function useBoxClient<T extends TokenStorage>(tokenStorage?: T): BoxClient;
export function useBoxClient<T extends string | AccessToken>(token?: T, config?: BoxTokenAuthConfig): BoxClient;
export function useBoxClient(...args: any[]): BoxClient {
  const factory = createCachedFunction(createBoxClient);
  return factory(...args);
}

export function createBoxClient(_auth?: string | AccessToken | Authentication | TokenStorage, config?: BoxTokenAuthConfig) {
  const { debug, developer, proxy } = useRuntimeConfig().public.box;

  let _client: BoxClient;
  if (!_auth && proxy) {
    _client = createProxyClient(proxy);
  }
  else if (isAuthentication(_auth)) {
    _client = new BoxClient({ auth: _auth });
  }
  else {
    const options: BoxTokenAuthOptions = { config };
    if (_auth) {
      if (isTokenStorage(_auth)) {
        options.tokenStorage = _auth;
      }
      else {
        options.token = _auth as string | AccessToken;
      }
    }
    else if (import.meta.dev) {
      options.token = developer?.token;
    }

    _client = new BoxClient({ auth: useBoxAuth(options) });
  }
  _client = _client.withExtraHeaders({
    'Access-Control-Allow-Origin': '*'
  });

  if (import.meta.dev) {
    return _client.withInterceptors([
      {
        beforeRequest(options) {
          if (debug) {
            console.log('Box Request: >>>  ', options.url);
          }
          return options;
        },
        afterRequest(response) {
          if (debug) {
            console.log('Box Response: >>>  ', response.url);
          }
          return response;
        }
      }
    ]);
  }

  return _client;
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxBasicClient(fields?: Omit<BoxTokenAuthOptions, 'config'>) {
  if (import.meta.dev) {
    const developer = useRuntimeConfig().public.box.developer;
    if (!fields?.token && developer?.token) {
      return new BoxClient({
        auth: new BoxTokenAuth({ ...fields, token: developer.token })
      });
    }
  }

  return new BoxClient({
    auth: new BoxTokenAuth(fields)
  });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
function createProxyClient(proxy: string) {
  if (import.meta.server) {
    return new BoxClient({ auth: useBoxAuth() });
  }

  proxy = ensureSuffix('/', proxy);
  return (new BoxClient({ auth: useBoxAuth({ token: 'token' }) })).withCustomBaseUrls({
    baseUrl: `${proxy}api`,
    uploadUrl: `${proxy}upload`
  });
}
