import { withBase } from 'ufo';
import { dirname } from 'pathe';
import { transform } from 'esbuild';
import { existsSync, promises, rmSync } from 'node:fs';
import { getProperty, setProperty } from '@whoj/utils-core';
import { addTemplate, resolveModule, useNuxt } from '@nuxt/kit';

export function setupScriptRegistry(resolve: (...p: string[]) => string, nuxt = useNuxt()) {
  setProperty(
    nuxt.options.alias,
    '#nuxt-scripts-validator/extended',
    resolve(`./runtime/validation/${(nuxt.options.dev || nuxt.options._prepare) ? 'valibot' : 'mock'}`)
  );

  const buildPublicAssetUrl = (assetPath: string) => withBase(assetPath, nuxt.options.app.buildAssetsDir);

  nuxt.hook('nitro:config', (nitroConfig) => {
    console.log(nuxt.options.dev);
    if (!nuxt.options.dev) {
      const { dst } = addTemplate({
        write: true,
        filename: 'modules/box-typescript-sdk-gen/lib/bundle.js',
        getContents: () => promises.readFile(resolveModule('box-typescript-sdk-gen/lib/bundle.js'), 'utf8')
          .then(str => transform(str, { minify: true, platform: 'browser' })
            .then(({ code }) => code))
      });

      nitroConfig.publicAssets.push({
        dir: dirname(dst),
        maxAge: 60 * 60 * 24 * 365,
        baseURL: buildPublicAssetUrl('box-typescript-sdk-gen/lib/')
      });
    }
  });

  if (!getProperty(nuxt.options, 'scripts.registry.boxSdk.file')) {
    setProperty(
      nuxt.options,
      'scripts.registry.boxSdk.file',
      buildPublicAssetUrl(
        !nuxt.options.dev
          ? 'box-typescript-sdk-gen/lib/bundle.js'
          : resolveModule('box-typescript-sdk-gen/lib/bundle.js')
      )
    );
  }

  nuxt.hooks.hook('scripts:registry', (registry) => {
    registry.push({
      label: 'Box TypeScript SDK',
      logo: '<svg xmlns="http://www.w3.org/2000/svg" width="59.15" height="32" viewBox="0 0 512 277"><path fill="#0061D5" d="M507.486 245.434c6.391 8.948 5.113 20.453-2.557 26.844c-8.948 6.392-21.73 5.113-28.122-2.556l-44.741-57.524l-43.462 56.245c-6.392 8.948-19.175 8.948-28.123 2.557c-8.948-6.392-10.226-17.896-3.835-26.844l51.132-66.472l-51.132-66.472c-6.391-8.948-3.835-21.73 3.835-28.122c8.948-6.392 21.731-3.835 28.123 3.835l43.462 57.523l44.74-54.967c6.392-8.948 17.897-10.226 28.123-3.835c8.948 6.392 8.948 19.175 2.557 28.123l-49.854 65.193zm-232.651-7.67c-33.236 0-60.08-25.566-60.08-58.802c0-31.957 26.844-58.802 60.08-58.802s60.08 26.845 60.08 58.802c-1.278 33.236-28.123 58.802-60.08 58.802m-176.406 0c-33.236 0-60.08-25.566-60.08-58.802c0-31.957 26.844-58.802 60.08-58.802s60.08 26.845 60.08 58.802c0 33.236-26.844 58.802-60.08 58.802M274.835 81.811c-37.07 0-70.307 20.453-86.925 51.132c-16.618-30.679-49.853-51.132-88.202-51.132c-23.01 0-43.463 7.67-60.08 19.175V19.175C39.627 8.948 30.678 0 20.452 0C8.948 0 0 8.948 0 19.175V180.24c1.278 53.688 44.74 95.872 98.43 95.872c38.348 0 71.584-21.73 88.202-52.41c16.618 30.68 49.854 52.41 86.925 52.41c54.967 0 99.707-43.462 99.707-98.43c1.278-52.41-43.462-95.872-98.43-95.872"/></svg>',
      category: 'utility',
      import: {
        name: 'useScriptBoxSdk',
        from: resolve('./runtime/scripts/box-sdk')
      },
      src: buildPublicAssetUrl(
        !nuxt.options.dev
          ? 'box-typescript-sdk-gen/lib/bundle.js'
          : resolveModule('box-typescript-sdk-gen/lib/bundle.js')
      )
    });
  });
}