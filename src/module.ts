import {
  defineNuxtModule,
  createResolver,
  hasNuxtModule,
  installModule,
  addImports,
  addServerHandler,
  addServerImports
} from '@nuxt/kit';
import { addBoxSchema } from './_/schema';
import { configureSdkOptions } from './_/config';
import { createClientClass } from './_/client';
import { registerTemplates } from './_/templates';
import { setupScriptRegistry } from './_/registry';
import type { BoxSdkOptions } from './runtime/shared/types';

import { name, version } from './../package.json';

export interface ModuleOptions extends BoxSdkOptions {
  /**
   * Name of Nitro (unstorage) mount point
   * if provided, it will be used in all types of auth.
   * Also, possible to override it for specific auth by proving on respective auth config
   *
   * @default Nitro's default KV Storage with prefix `box`
   * @see https://nitro.build/guide/storage
   */
  tokenStorage?: string;
  /**
   * @default `true` if Nuxt Debug Mode enabled
   */
  debug?: boolean;

  /**
   * Modify/Disable Nitro routes
   * If Not SSR or provided `false` nitro routes won't be registered
   *
   * You may disable specific route by providing `false` for that
   */
  routes?: {
    // Login Route
    login?: {
      /**
       * @default '/box/authenticate'
       */
      path: string;
      /**
       * @default 'get'
       */
      method?: 'get' | 'post';
    } | false;

    // Auth Redirect Route
    redirect?: {
      /**
       * @default '/box/authenticate/callback'
       */
      path: string;
      /**
       * @default 'get'
       */
      method?: 'get' | 'post';
    } | false;

    /**
     * Token Retrieve/Refresh Route
     * Will be used from client side
     */
    token?: {
      /**
       * @default '/_box/token' with get method
       */
      retrieve?: string;

      /**
       * @default '/_box/token' with post method
       */
      refresh?: string;

      /**
       * Auth type to use when getting token
       * It's only useful when you've multiple auth type configured
       *
       * By default, it will use the value from `auth` option
       */
      authType?: string;
    } | false;
  } | false;

  /**
   * client - If you want BoxSdk only on client side
   * server - If you want BoxSdk only on server (nitro)
   * @default 'auto'
   */
  mode?: 'auto' | 'client' | 'server';
}

const configKey = 'box' as const;

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name,
    version,
    configKey,
    compatibility: {
      nuxt: '>=3.13'
    }
  },
  defaults: ({ options }) => ({
    mode: 'auto',
    debug: options.debug,
    routes: {
      login: {
        method: 'get' as const,
        path: '/box/authenticate' as const
      },
      redirect: {
        method: 'get' as const,
        path: '/box/authenticate/callback' as const
      },
      token: {
        refresh: '/_box/token' as const,
        retrieve: '/_box/token' as const
      }
    }
  }),
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    // const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

    nuxt.options.build.transpile.push(resolve('./runtime/'));

    setupScriptRegistry(resolve, nuxt);
    if (!hasNuxtModule('@nuxt/scripts')) {
      await installModule('@nuxt/scripts');
    }

    configureSdkOptions(options, nuxt);

    createClientClass(resolve, options.managers);

    nuxt.options.alias['#nuxt/box-sdk/types'] = resolve('./runtime/shared/types');
    nuxt.options.alias['#nuxt/box-sdk/utils'] = resolve('./runtime/shared/utils');

    registerTemplates(resolve, nuxt);

    if (options.mode !== 'server') {
      addImports(['useBoxAuth', 'useBoxClient'].map(name => ({
        name,
        from: resolve('./runtime/composables/index')
      })));
    }

    if (options.mode !== 'client') {
      addServerImports(['useBoxAuth', 'useBoxClient', 'useBoxCcgClient', 'useBoxJwtClient', 'useBoxOAuthClient', 'useBoxTokenStorage'].map(name => ({
        name,
        from: resolve('./runtime/server/utils/index')
      })));
    }

    if (nuxt.options.ssr && options.mode !== 'client' && options.routes !== false) {
      if (options.routes.login !== false) {
        addServerHandler({
          route: options.routes.login.path,
          method: options.routes.login.method,
          handler: resolve('./runtime/server/handler/login')
        });
      }

      if (options.routes.redirect !== false) {
        addServerHandler({
          route: options.routes.redirect.path,
          method: options.routes.redirect.method,
          handler: resolve('./runtime/server/handler/redirect')
        });
      }

      if (options.routes.token !== false) {
        addServerHandler({
          method: 'get',
          route: options.routes.token.retrieve,
          handler: resolve('./runtime/server/handler/token')
        });

        addServerHandler({
          method: 'post',
          route: options.routes.token.refresh,
          handler: resolve('./runtime/server/handler/token')
        });
      }
    }

    addBoxSchema(nuxt);
  }
});

export interface ModuleRuntimeConfig {
  box: Pick<ModuleOptions, 'ccg' | 'jwt' | 'oauth' | 'tokenStorage'>;
}

export interface ModulePublicRuntimeConfig {
  box: Pick<ModuleOptions, 'auth' | 'debug' | 'developer' | 'routes'>;
}
