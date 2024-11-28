import { defu } from 'defu';
import { useNuxt } from '@nuxt/kit';
import type { BoxSdkOptions } from '../runtime/shared';
import { deleteProperty, isString, objectPick, setProperty } from '@whoj/utils-core';

export function configureSdkOptions(options: BoxSdkOptions, nuxt = useNuxt()) {
  const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

  const runtimeConfig: Omit<BoxSdkOptions, 'auth' | 'developer'> = defu(
    (nuxt.options.runtimeConfig.box || {}),
    {
      ...objectPick(options, ['ccg', 'jwt', 'oauth'])
    },
    {
      ccg: {
        clientId: '',
        clientSecret: ''
      },
      // @ts-ignore
      jwt: {
        clientId: '',
        clientSecret: '',
        jwtKeyId: '',
        privateKey: '',
        privateKeyPassphrase: '',
        enterpriseId: '',
        userId: undefined,
        algorithm: undefined,
        configFile: ''
      },
      oauth: {
        clientId: '',
        clientSecret: ''
      }
    }
  );

  const publicRuntimeConfig: Pick<BoxSdkOptions, 'auth' | 'developer'> = defu(
    (nuxt.options.runtimeConfig.public.box || {}),
    {
      ...objectPick(options, ['auth', 'developer'])
    },
    {
      auth: options.auth,
      developer: options.developer || { token: '' }
    }
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

  setProperty(nuxt.options.runtimeConfig, 'box', runtimeConfig);
  setProperty(nuxt.options.runtimeConfig, 'public.box', publicRuntimeConfig);
}
