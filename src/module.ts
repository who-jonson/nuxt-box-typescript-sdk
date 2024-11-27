import {
  defineNuxtModule,
  createResolver,
  hasNuxtModule,
  installModule,
  useLogger
} from '@nuxt/kit';
import { configureSdkOptions } from './_/config';
import { setupScriptRegistry } from './_/registry';
import type { BoxSdkOptions } from './runtime/shared/types';

import { name, version } from './../package.json';

export interface ModuleOptions extends BoxSdkOptions {
  /**
   * @default `true`
   */
  autoImports?: boolean;
}

const configKey = 'boxSdk' as const;
const logger = useLogger(name);

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name,
    version,
    configKey,
    compatibility: {
      nuxt: '>=3.13'
    }
  },
  defaults: {

  },
  async setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);

    configureSdkOptions(options, nuxt);

    nuxt.options.alias['#nuxt-box-sdk/shared'] = resolve('./runtime/shared/index');

    setupScriptRegistry(resolve, nuxt);

    if (!hasNuxtModule('@nuxt/scripts')) {
      await installModule('@nuxt/scripts');
    }

    nuxt.options.build.transpile.push(
      resolve('./runtime/')
    );

    // addPlugin(resolve('./runtime/plugin'));
  }
});

export interface ModuleRuntimeConfig {
  box: Omit<BoxSdkOptions, 'auth' | 'developer'>;
}

export interface ModulePublicRuntimeConfig {
  box: Pick<BoxSdkOptions, 'auth' | 'developer'>;
}
