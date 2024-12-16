import { registerImports } from './_/client';
import type { ModuleOptions } from './types';
import { configureSdkOptions } from './_/config';
import { registerTypeTemplates } from './_/templates';
import { defineNuxtModule, createResolver, addServerHandler, addServerPlugin } from '@nuxt/kit';

import { name, version } from './../package.json';

const configKey = 'box' as const;

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name,
    version,
    configKey,
    compatibility: {
      nuxt: '>=3.14'
    }
  },
  defaults: ({ options }) => ({
    mode: 'auto',
    debug: options.debug,
    proxy: options.ssr ? '/_box/proxy' as const : false,
    managers: {
      composables: true
    },
    routes: {
      login: {
        method: 'get' as const,
        path: '/_box/authenticate' as const
      },
      redirect: {
        method: 'get' as const,
        path: '/_box/authenticate/callback' as const
      }
    }
  }),
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    nuxt.options.build.transpile.push(resolve('./runtime/'));

    configureSdkOptions(options, nuxt);

    nuxt.options.alias['#nuxt/box-sdk/types'] = resolve('./runtime/shared/types');
    nuxt.options.alias['#nuxt/box-sdk/utils'] = resolve('./runtime/shared/utils');

    registerImports(resolve, options, nuxt);
    registerTypeTemplates(!!(nuxt.options.ssr && options.mode !== 'client' && options.proxy));

    if (nuxt.options.ssr && options.mode !== 'client') {
      if (options.routes !== false) {
        if (options.routes.login !== false) {
          addServerHandler({
            route: options.routes.login.path,
            method: options.routes.login.method,
            handler: resolve('./runtime/server/handlers/login')
          });
        }

        if (options.routes.redirect !== false) {
          addServerHandler({
            route: options.routes.redirect.path,
            method: options.routes.redirect.method,
            handler: resolve('./runtime/server/handlers/redirect')
          });
        }
      }

      if (options.proxy) {
        addServerHandler({
          middleware: true,
          handler: resolve('./runtime/server/handlers/proxy')
        });

        addServerPlugin(resolve('./runtime/server/plugins/box'));
      }
    }
  }
});

export type { ModuleOptions, ModuleRuntimeConfig, ModulePublicRuntimeConfig } from './types';
