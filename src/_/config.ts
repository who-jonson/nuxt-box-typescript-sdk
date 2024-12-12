import { defu } from 'defu';
import { updateRuntimeConfig, useNuxt } from '@nuxt/kit';
import { deleteProperty, isString } from '@whoj/utils-core';
import type { ModuleOptions, ModuleRuntimeConfig, ModulePublicRuntimeConfig } from '../types';

export function configureSdkOptions(options: ModuleOptions, nuxt = useNuxt()) {
  const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

  let runtimeConfig: ModuleRuntimeConfig['box'] = {};

  if (options.ccg || options.auth === 'ccg') {
    runtimeConfig.ccg = {
      clientId: '',
      clientSecret: '',
      enterpriseId: '',
      userId: '',
      ...(options.ccg || {})
    };
  }

  if (options.jwt || options.auth === 'jwt') { // @ts-ignore
    runtimeConfig.jwt = {
      clientId: '',
      clientSecret: '',
      jwtKeyId: '',
      privateKey: '',
      privateKeyPassphrase: '',
      enterpriseId: '',
      userId: '',
      algorithm: undefined,
      configFile: '',
      configJson: '',
      ...(options.jwt || {})
    };
  }

  if (options.oauth || options.auth === 'oauth') {
    runtimeConfig.oauth = {
      clientId: '',
      clientSecret: '',
      ...(options.oauth || {})
    };
  }

  runtimeConfig = defu((nuxt.options.runtimeConfig.box || {}), runtimeConfig);

  const publicRuntimeConfig = defu(
    (nuxt.options.runtimeConfig.public.box || {}),
    { // @ts-ignore
      auth: options.auth ?? '',
      ...(isDev ? { developer: { token: '' }, debug: options.debug } : {}),
      routes: options.routes ? options.routes : undefined
    } satisfies ModulePublicRuntimeConfig['box']
  );

  if (nuxt.options.ssr && options.mode !== 'client' && options.proxy !== false) {
    publicRuntimeConfig.proxy = isString(options.proxy) ? options.proxy : '/_box/proxy';
  }

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

  updateRuntimeConfig({
    box: runtimeConfig,
    public: {
      box: publicRuntimeConfig
    }
  });
}
