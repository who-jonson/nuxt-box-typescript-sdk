import {
  defineNuxtModule,
  createResolver,
  hasNuxtModule,
  installModule,
  resolveModule
} from '@nuxt/kit';
import { configureSdkOptions } from './_/config';
import { registerTemplates } from './_/templates';
import { setupScriptRegistry } from './_/registry';
import type { BoxSdkOptions } from './runtime/shared';

import { name, version } from './../package.json';

export interface ModuleOptions extends BoxSdkOptions {
  /**
   * @default `true`
   */
  autoImports?: boolean;
}

const configKey = 'boxSdk' as const;

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
    const isDev = !!(nuxt.options.dev || nuxt.options._prepare);

    nuxt.options.build.transpile.push(resolve('./runtime/'));

    setupScriptRegistry(resolve, nuxt);
    if (!hasNuxtModule('@nuxt/scripts')) {
      await installModule('@nuxt/scripts');
    }

    configureSdkOptions(options, nuxt);

    if (!isDev) {
      nuxt.options.alias['node-fetch'] = resolveModule('unenv/runtime/npm/node-fetch');
    }
    nuxt.options.alias['#nuxt/box-typescript-sdk/utils'] = resolve('./runtime/shared/index');

    registerTemplates(resolve, nuxt);
  }
});

export interface ModuleRuntimeConfig {
  box: Omit<BoxSdkOptions, 'auth' | 'developer'>;
}

export interface ModulePublicRuntimeConfig {
  box: Pick<BoxSdkOptions, 'auth' | 'developer'>;
}

export type { NitroRuntimeHooks, RuntimeNuxtHooks } from './runtime/shared';
