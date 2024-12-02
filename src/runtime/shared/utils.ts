import { hasOwnProperty, isFunction, isObject } from '@whoj/utils-core';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';

const cache = /* @__PURE__ */ new Map<string, any>();

/**
 * @__NO_SIDE_EFFECTS__
 */
export function createCachedFunction<T extends ((...args: unknown[]) => unknown)>(fn: T, tap?: (result: ReturnType<T>) => ReturnType<T>): T {
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
