import type { BoxSdkOptions } from './runtime/shared/types';

export interface ModuleOptions extends BoxSdkOptions {
  /**
   * Name of Nitro (unstorage) mount point
   * if provided, it will be used in all types of auth.
   * Also, possible to override it for specific auth by proving on respective auth config
   *
   * @default Nitro's default `cache` mount point with prefix `box`
   *
   * @see [Nitro Storage](https://nitro.build/guide/storage)
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
       * @default '/_box/authenticate'
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
       * @default '/_box/authenticate/callback'
       */
      path: string;
      /**
       * @default 'get'
       */
      method?: 'get' | 'post';
    } | false;
  } | false;

  /**
   * client - If you want BoxSdk only on client side
   * server - If you want BoxSdk only on server (nitro)
   * @default 'auto'
   */
  mode?: 'auto' | 'client' | 'server';

  /**
   * Proxy Box Api calls from browser
   * This can only be enabled if you're using ssr
   *
   * @default `/_box/proxy` - when `ssr` enabled
   * @see [unjs/httpxy](https://github.com/unjs/httpxy)
   */
  proxy?: false | string;
}

export interface ModuleRuntimeConfig {
  box: Pick<ModuleOptions, 'ccg' | 'jwt' | 'oauth' | 'tokenStorage'>;
}

export interface ModulePublicRuntimeConfig {
  box: Pick<ModuleOptions, 'auth' | 'debug' | 'developer' | 'routes' | 'proxy'> & { proxy?: string };
}
