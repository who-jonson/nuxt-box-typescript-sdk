import { isDef } from '@whoj/utils-core';
import type { BoxAuthType } from './types';
import { createError, useRuntimeConfig } from '#imports';
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

export function useBoxAuth<T extends BoxAuthType>(authType?: T, _config?: UseBoxAuthConfigInput<T>): UseBoxAuthReturns<T> | undefined {
  authType ||= useRuntimeConfig().public.box.auth;

  const config = useBoxAuthConfig<T>(authType, _config);

  if (!config) {
    return;
  }

  if (import.meta.dev) {
    if (authType === 'dev') {
      return /* @__PURE__ */ new BoxDeveloperTokenAuth(config as UseBoxAuthConfig<'dev'>) as UseBoxAuthReturns<T>;
    }
  }

  if (authType === 'oauth') {
    return /* @__PURE__ */ new BoxOAuth({ config: config as UseBoxAuthConfig<'oauth'> }) as UseBoxAuthReturns<T>;
  }

  if (import.meta.nitro) {
    if (authType === 'ccg') {
      return /* @__PURE__ */ new BoxCcgAuth({ config: config as UseBoxAuthConfig<'ccg'> }) as UseBoxAuthReturns<T>;
    }
    if (authType === 'jwt') {
      return /* @__PURE__ */ new BoxJwtAuth({ config: config as UseBoxAuthConfig<'jwt'> }) as UseBoxAuthReturns<T>;
    }
  }
}

export function useBoxAuthConfig<T extends BoxAuthType>(auth?: T, config?: UseBoxAuthConfigInput<T>): UseBoxAuthConfig<T> {
  if (!isDef(auth)) {
    if (useRuntimeConfig().public.box?.auth) {
      auth = useRuntimeConfig().public.box.auth;
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
    }
    else { // @ts-ignore
      config = useRuntimeConfig().box[auth];
    }
  }

  if (!config) {
    throw createError({
      name: 'InvalidBoxAuthConfig',
      message: `You must provide a valid configuration for '${auth}' box auth!`
    });
  }

  if (import.meta.nitro) {
    if (auth === 'jwt') {
      if ((config as any)?.configFile?.length) {
        return JwtConfig.fromConfigFile((config as any).configFile) as UseBoxAuthConfig<T>;
      }
      return new JwtConfig(config as UseBoxAuthConfigInput<'jwt'>) as UseBoxAuthConfig<T>;
    }
    else if (auth === 'ccg') {
      return new CcgConfig(config as UseBoxAuthConfigInput<'ccg'>) as UseBoxAuthConfig<T>;
    }
  }

  if (auth === 'oauth') {
    return new OAuthConfig(config as UseBoxAuthConfigInput<'oauth'>) as UseBoxAuthConfig<T>;
  }

  return config as UseBoxAuthConfig<T>;
}
