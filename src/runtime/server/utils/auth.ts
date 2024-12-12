import { useEvent } from '#imports';
import { useBoxTokenStorage } from './storage';
import * as authUtils from '../../shared/auth';
import { isDef, isFunction, isString, isObject } from '@whoj/utils-core';

export type { UseBoxAuthConfig, UseBoxAuthConfigInput, UseBoxAuthReturns, BoxTokenStorageOptions } from '../../shared/auth';

/**
 * @__NO_SIDE_EFFECTS__
 */
export const useBoxAuth: typeof authUtils.useBoxAuth = /* @__PURE__ */ withTokenStorage(authUtils.useBoxAuth, (args) => {
  if (!args.length || (isObject<any>(args[0]) && !args[0].tokenStorage)) {
    args[0] ||= {};
    args[0].tokenStorage = resolveTokenStorage(args[0]?.authType);
  }
  else if (isString(args[0]) && !isDef(args[2])) {
    args[2] = resolveTokenStorage(args[0]);
  }
  return args;
});

function resolveTokenStorage(auth?: string) {
  try {
    if (isFunction(useEvent()?.context.$box?.resolveTokenStorage)) {
      return useEvent().context.$box.resolveTokenStorage(auth);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch (e) {
    return useBoxTokenStorage('cache', { auth });
  }
}

function withTokenStorage<T extends ((...args: any[]) => any)>(fn: T, setter: (args: any[]) => any[]): T {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      return target.apply(thisArg, setter(args));
    }
  });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export const useBoxOAuth: typeof authUtils.useBoxOAuth = /* @__PURE__ */ withTokenStorage(authUtils.useBoxOAuth, (args) => {
  if (!args.length || !args[1]) {
    args[1] = resolveTokenStorage('oauth');
  }
  return args;
});

/**
 * @__NO_SIDE_EFFECTS__
 */
export const useBoxCcgAuth: typeof authUtils.useBoxCcgAuth = /* @__PURE__ */ withTokenStorage(authUtils.useBoxCcgAuth, (args) => {
  if (!args.length || !args[1]) {
    args[1] = resolveTokenStorage('ccg');
  }
  return args;
});

/**
 * @__NO_SIDE_EFFECTS__
 */
export const useBoxJwtAuth: typeof authUtils.useBoxJwtAuth = /* @__PURE__ */ withTokenStorage(authUtils.useBoxJwtAuth, (args) => {
  if (!args.length || !args[1]) {
    args[1] = resolveTokenStorage('jwt');
  }
  return args;
});

export { useBoxAuthConfig } from '../../shared/auth';
