import { isTokenStorage } from '#nuxt/box-sdk/utils';
import type { BoxAuthType } from '#nuxt/box-sdk/types';
import { createError, useRuntimeConfig } from '#imports';
import { isDef, getProperty, isString, isFunction, isObject } from '@whoj/utils-core';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';
import { BoxDeveloperTokenAuth } from 'box-typescript-sdk-gen/lib/box/developerTokenAuth.generated.js';
import { BoxOAuth, OAuthConfig, type OAuthConfigInput } from 'box-typescript-sdk-gen/lib/box/oauth.generated.js';
import { BoxCcgAuth, CcgConfig, type CcgConfigInput } from 'box-typescript-sdk-gen/lib/box/ccgAuth.generated.js';
import { BoxJwtAuth, JwtConfig, type JwtConfigInput } from 'box-typescript-sdk-gen/lib/box/jwtAuth.generated.js';

export type UseBoxAuthConfig<T extends BoxAuthType> = T extends 'dev'
  ? ConstructorParameters<typeof BoxDeveloperTokenAuth>[0]
  : T extends 'ccg'
    ? CcgConfig
    : T extends 'jwt'
      ? JwtConfig
      : OAuthConfig;

export type UseBoxAuthConfigInput<T extends BoxAuthType> = T extends 'dev'
  ? ConstructorParameters<typeof BoxDeveloperTokenAuth>[0]
  : T extends 'ccg'
    ? CcgConfigInput
    : T extends 'jwt'
      ? JwtConfigInput
      : OAuthConfigInput;

export type UseBoxAuthReturns<T extends BoxAuthType> = T extends 'dev'
  ? BoxDeveloperTokenAuth
  : T extends 'ccg'
    ? BoxCcgAuth
    : T extends 'jwt'
      ? BoxJwtAuth
      : BoxOAuth;

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxAuth<T extends BoxAuthType>(options?: { authType?: T; config?: UseBoxAuthConfigInput<T> | UseBoxAuthConfig<T>; tokenStorage?: TokenStorage }): UseBoxAuthReturns<T> | undefined;
export function useBoxAuth<T extends BoxAuthType>(authType?: T, config?: UseBoxAuthConfigInput<T> | UseBoxAuthConfig<T>, tokenStorage?: TokenStorage): UseBoxAuthReturns<T> | undefined;
export function useBoxAuth<T extends BoxAuthType>(...args: any[]): UseBoxAuthReturns<T> | undefined {
  let authType: T, _config: UseBoxAuthConfigInput<T> | UseBoxAuthConfig<T>, tokenStorage: TokenStorage;

  if (isObject<any>(args[0])) {
    authType = args[0].authType;
    _config = args[0].config;
    tokenStorage = args[0].tokenStorage;
  }
  else {
    [authType, _config, tokenStorage] = args;
  }

  authType ||= useRuntimeConfig().public.box.auth as T;

  const config = useBoxAuthConfig<T>(authType, _config, tokenStorage);

  if (!config) {
    return;
  }

  if (import.meta.dev && authType === 'dev') {
    return new BoxDeveloperTokenAuth(config as UseBoxAuthConfig<'dev'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'oauth') {
    return /* @__PURE__ */ useBoxOAuth(_config as UseBoxAuthConfig<'oauth'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'ccg') {
    return /* @__PURE__ */ useBoxCcgAuth(config as UseBoxAuthConfig<'ccg'>) as UseBoxAuthReturns<T>;
  }

  if (authType === 'jwt') {
    return /* @__PURE__ */ useBoxJwtAuth(config as UseBoxAuthConfig<'jwt'>) as UseBoxAuthReturns<T>;
  }
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxOAuth(config?: OAuthConfig | OAuthConfigInput, tokenStorage?: TokenStorage) {
  return new BoxOAuth({ config: useBoxAuthConfig('oauth', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxCcgAuth(config?: CcgConfig | CcgConfigInput, tokenStorage?: TokenStorage) {
  return new BoxCcgAuth({ config: useBoxAuthConfig('ccg', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxJwtAuth(config?: JwtConfig | JwtConfigInput, tokenStorage?: TokenStorage) {
  return new BoxJwtAuth({ config: useBoxAuthConfig('jwt', config, tokenStorage) });
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxAuthConfig<T extends BoxAuthType>(auth?: T, config?: UseBoxAuthConfigInput<T>, tokenStorage?: TokenStorage): UseBoxAuthConfig<T> {
  if (!isDef(auth)) {
    if (useRuntimeConfig().public.box?.auth) {
      auth = useRuntimeConfig().public.box.auth as T;
    }
    else {
      throw createError({
        name: 'InvalidBoxAuthTypeError',
        message: 'You must provide a valid box auth type!'
      });
    }
  }

  if (!config) {
    if (import.meta.dev && auth === 'dev') { // @ts-ignore
      config = useRuntimeConfig().public.box.developer;
    } // @ts-ignore
    else if (useRuntimeConfig().box[auth]) { // @ts-ignore
      config = useRuntimeConfig().box[auth];
    }
    else {
      throw createError({
        name: 'InvalidBoxAuthConfig',
        message: `You must provide a valid configuration for '${auth}' box auth!`
      });
    }
  }

  if (auth !== 'dev' && !isTokenStorage(getProperty(config, 'tokenStorage'))) {
    config = Object.assign({}, config, {
      tokenStorage: tokenStorage ?? useBoxTokenStorage({ auth })
    });
  }

  if (auth === 'ccg') {
    return new CcgConfig(config as UseBoxAuthConfigInput<'ccg'>) as UseBoxAuthConfig<T>;
  }

  if (auth === 'jwt') {
    if ((config as any)?.configFile?.length) {
      return JwtConfig.fromConfigFile(
        (config as any).configFile,
        (config as any).tokenStorage
      ) as UseBoxAuthConfig<T>;
    }

    if ((config as any)?.configJson) {
      return JwtConfig.fromConfigJsonString(
        isString((config as any).configJson)
          ? (config as any).configJson
          : JSON.stringify((config as any).configJson),
        (config as any).tokenStorage
      ) as UseBoxAuthConfig<T>;
    }

    return new JwtConfig(config as UseBoxAuthConfigInput<'jwt'>) as UseBoxAuthConfig<T>;
  }

  if (auth === 'oauth') {
    return new OAuthConfig(config as UseBoxAuthConfigInput<'oauth'>) as UseBoxAuthConfig<T>;
  }

  return config as UseBoxAuthConfig<T>;
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
  getKey?: () => string;
}

class BoxTokenStorage implements TokenStorage {
  #tokens = new Map<string, AccessToken>();

  constructor(
    protected readonly config: BoxTokenStorageOptions = {}
  ) {}

  store(token: AccessToken) {
    this.#tokens.set(this.getKey(), token);
    return Promise.resolve<undefined>(undefined);
  }

  get() {
    return Promise.resolve(this.#tokens.get(this.getKey()));
  }

  clear() {
    if (this.#tokens.has(this.getKey())) {
      this.#tokens.delete(this.getKey());
    }
    return Promise.resolve<undefined>(undefined);
  }

  private getKey() {
    if (isFunction(this.config.getKey)) {
      return this.config.getKey();
    }

    return `${this.config.auth}:access_token`;
  }
}

function useBoxTokenStorage(options: BoxTokenStorageOptions = {}): TokenStorage {
  return new BoxTokenStorage(options);
}
