import type { Class } from '@whoj/utils-types';
import { useBoxAuth, useRuntimeConfig } from '#imports';
import type { AgentOptions } from 'box-typescript-sdk-gen/lib/internal/utils.js';
import { ensureSuffix, hasOwnProperty, isFunction, isObject } from '@whoj/utils-core';
import { BaseUrls } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';
import { NetworkSession } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';
import type { ProxyConfig } from 'box-typescript-sdk-gen/lib/networking/proxyConfig.generated.js';
import type { BaseUrlsInput } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';
import type { BoxManager, BoxManagerNetworkSession, ExtendedManager } from '#nuxt/box-sdk/types';
import type { Interceptor } from 'box-typescript-sdk-gen/lib/networking/interceptors.generated.js';

/**
 * @__NO_SIDE_EFFECTS__
 */
export function createCachedFunction<T extends ((...args: unknown[]) => unknown)>(fn: T, tap?: (result: ReturnType<T>) => ReturnType<T>): T {
  const cache = /* @__PURE__ */ new Map<string, ReturnType<T>>();

  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const cacheKey = JSON.stringify(args);
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }

      let result = target.apply(thisArg, args);
      if (typeof tap === 'function') {
        result = tap(result);
      }
      cache.set(cacheKey, result);
      return result;
    }
  });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function invokeCachedFunction<T extends ((...args: unknown[]) => any)>(fn: T, ...args: Parameters<T>): ReturnType<T> {
  return createCachedFunction(fn)(...args);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isAccessToken<T extends AccessToken>(value: unknown): value is T {
  return isObject<T>(value) && hasOwnProperty(value, 'accessToken');
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isAuthentication<T extends Authentication>(value: unknown): value is T {
  return isObject<T>(value)
    && isFunction(value.retrieveToken)
    && isFunction(value.refreshToken);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function isTokenStorage<T extends TokenStorage>(value: unknown): value is T {
  return isObject<T>(value)
    && isFunction(value.get)
    && isFunction(value.clear)
    && isFunction(value.store);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export const createBoxManager: typeof boxManagerFactory = /* @__PURE__ */ createCachedFunction(boxManagerFactory);

/**
 * @__NO_SIDE_EFFECTS__
 */
function boxManagerFactory<T extends Class<any>>(
  manager: T,
  auth?: Authentication,
  networkSession?: BoxManagerNetworkSession | NetworkSession
): BoxManager<T> {
  const Manager = class extends manager implements ExtendedManager {
    withAsUserHeader(userId: string) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withAdditionalHeaders({
          ['As-User']: userId
        })
      });
    }

    withSuppressedNotifications() {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withAdditionalHeaders({
          ['Box-Notifications']: 'off'
        })
      });
    }

    withExtraHeaders(extraHeaders?: { [p: string]: string }) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withAdditionalHeaders(extraHeaders)
      });
    }

    withCustomAgentOptions(agentOptions: AgentOptions) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withCustomAgentOptions(agentOptions)
      });
    }

    withCustomBaseUrls(baseUrlsInput: BaseUrlsInput) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withCustomBaseUrls(new BaseUrls(baseUrlsInput))
      });
    }

    withInterceptors(interceptors: Interceptor[]) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withInterceptors(interceptors)
      });
    }

    withProxy(config: ProxyConfig) {
      return new Manager({
        auth: this.auth,
        networkSession: this.networkSession.withProxy(config)
      });
    }
  };

  const { debug, proxy } = useRuntimeConfig().public.box;

  if (!networkSession) {
    networkSession = new NetworkSession({
      baseUrls: new BaseUrls(
        import.meta.client && !auth && proxy
          ? {
              baseUrl: `${ensureSuffix('/', proxy)}api`,
              uploadUrl: `${ensureSuffix('/', proxy)}upload`
            }
          : {}
      )
    });
  }
  else if (!(networkSession instanceof NetworkSession)) {
    if (!networkSession.baseUrls) {
      networkSession = new NetworkSession({ ...networkSession, baseUrls: new BaseUrls({}) });
    }
    else if (!(networkSession.baseUrls instanceof BaseUrls)) {
      networkSession = new NetworkSession({ ...networkSession, baseUrls: new BaseUrls(networkSession.baseUrls) });
    }
  }

  networkSession = (networkSession as NetworkSession).withAdditionalHeaders({ 'Access-Control-Allow-Origin': '*' });
  if (import.meta.dev && debug) {
    networkSession = (networkSession as NetworkSession).withInterceptors([
      {
        beforeRequest(options) {
          console.log('Box Request: >>>  ', options.url);
          return options;
        },
        afterRequest(response) {
          console.log('Box Response: >>>  ', response.url);
          return response;
        }
      }
    ]);
  }

  return new Manager({ auth: auth ?? useBoxAuth(), networkSession });
}
