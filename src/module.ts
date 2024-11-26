import {
  addTemplate,
  defineNuxtModule,
  addPlugin,
  createResolver,
  hasNuxtModule,
  installModule,
  useLogger
} from '@nuxt/kit';
import type { ModuleOptions } from './options';
import { setupScriptRegistry } from './registry';

import { name, version } from './../package.json';

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

    nuxt.options.alias['#nuxt-box-sdk/shared'] = resolve('./runtime/shared/');

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

export type * from './options';
