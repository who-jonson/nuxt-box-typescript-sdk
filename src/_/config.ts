import { defu } from 'defu';
import { useNuxt } from '@nuxt/kit';
import type { ModuleOptions } from '../module';
import { deleteProperty, isString, setProperty } from '@whoj/utils-core';

export function configureSdkOptions(options: ModuleOptions, nuxt = useNuxt()) {
  const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

  const runtimeConfig = defu(
    (nuxt.options.runtimeConfig.box || {}),
    {
      ccg: options.ccg ?? {
        clientId: '',
        clientSecret: '',
        enterpriseId: '',
        userId: ''
      },
      // @ts-ignore
      jwt: options.jwt ?? {
        clientId: '',
        clientSecret: '',
        jwtKeyId: '',
        privateKey: '',
        privateKeyPassphrase: '',
        enterpriseId: '',
        userId: '',
        algorithm: undefined,
        configFile: '',
        configJson: ''
      },
      oauth: options.oauth ?? {
        clientId: '',
        clientSecret: ''
      },
      tokenStorage: options.tokenStorage ?? null
    } satisfies Pick<ModuleOptions, 'ccg' | 'jwt' | 'oauth' | 'tokenStorage'>
  );

  const publicRuntimeConfig = defu(
    (nuxt.options.runtimeConfig.public.box || {}),
    { // @ts-ignore
      auth: options.auth ?? '',
      ...(isDev ? { developer: { token: '' }, debug: options.debug } : {}),
      routes: options.routes ? options.routes : undefined
    } satisfies Pick<ModuleOptions, 'auth' | 'debug' | 'developer' | 'routes'>
  );

  if (isDev) {
    const developerToken = import.meta.env.BOX_DEVELOPER_TOKEN
      || import.meta.env.NUXT_PUBLIC_BOX_DEVELOPER_TOKEN
      || import.meta.env.NUXT_BOX_DEVELOPER_TOKEN;
    if (isString(developerToken)) {
      publicRuntimeConfig.developer.token = developerToken;
    }

    if (!options.auth && publicRuntimeConfig.developer.token) {
      publicRuntimeConfig.auth = 'dev';
    }
  }
  else if (publicRuntimeConfig.developer) {
    deleteProperty(publicRuntimeConfig, 'developer');
  }

  if (options.routes && options.routes.token) {
    options.routes.token.authType ||= publicRuntimeConfig.auth;
  }

  setProperty(nuxt.options.runtimeConfig, 'box', runtimeConfig);
  setProperty(nuxt.options.runtimeConfig, 'public.box', publicRuntimeConfig);
}
