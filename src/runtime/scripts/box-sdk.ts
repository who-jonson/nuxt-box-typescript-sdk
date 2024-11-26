import { objectPick } from '@whoj/utils-core';
import type * as BoxSdk from 'box-typescript-sdk-gen';
import type * as NuxtScriptTypes from '#nuxt-scripts';
import { useRegistryScript } from '#nuxt-scripts-utils';
import { array, maxLength, minLength, object, optional, picklist, pipe, string } from '#nuxt-scripts-validator/extended';

const BoxSdkExports: Array<keyof typeof BoxSdk> = ['BoxClient', 'BoxCcgAuth', 'BoxDeveloperTokenAuth', 'BoxJwtAuth', 'CcgConfig', 'JwtConfig', 'BoxOAuth', 'OAuthConfig'] as const;

export const BoxSdkOptions = object({
  file: optional(string()),
  exports: optional(
    pipe(
      array(picklist(BoxSdkExports)),
      minLength(1),
      maxLength(BoxSdkExports.length)
    )
  )
});

export type BoxSdkInput = NuxtScriptTypes.RegistryScriptInput<typeof BoxSdkOptions, true, true, false>;

export function useScriptBoxSdk<T extends BoxSdkInput>(_options?: T) {
  return useRegistryScript<T['exports'] extends undefined ? typeof BoxSdk : Pick<typeof BoxSdk, Exclude<T['exports'], undefined>[number]>, typeof BoxSdkOptions>(
    'boxSdk',
    (options) => {
      return {
        scriptInput: {
          id: 'box-typescript-sdk-gen',
          src: options.file || 'https://cdn.jsdelivr.net/npm/box-typescript-sdk-gen/lib/bundle.js'
        },
        schema: import.meta.dev ? BoxSdkOptions : undefined,
        scriptOptions: {
          use: () => {
            const _BoxSdk = window['box-typescript-sdk-gen'];
            if (!options.exports?.length) {
              return _BoxSdk;
            }

            return objectPick(_BoxSdk, options.exports);
          }
        }
      };
    },
    _options
  );
}

export interface BoxSdkApi {
  'box-typescript-sdk-gen': typeof BoxSdk;
}

declare global {
  interface Window extends BoxSdkApi {}
}
