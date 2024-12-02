import type { Schema } from 'untyped';
import { objectPick } from '@whoj/utils-core';
import { extendNuxtSchema, useNuxt } from '@nuxt/kit';

const schemaProperties = <Schema['properties']>{
  auth: {
    title: 'Default Auth to use',
    type: 'string',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxAuthType',
    description: 'When application running in development mode & provided `developer.token` Then `developer.token` will be used as default auth'
  },
  ccg: {
    title: 'Client Credentials Grant Config',
    type: 'object',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxCcgConfig'
  },
  jwt: {
    title: 'Jwt Auth Config',
    type: 'object',
    tsType: '{ configFile: `${string}.json` } | import(\'#nuxt/box-sdk/types\').BoxJwtConfig'
  },
  oauth: {
    title: 'OAuth 2.0  Config',
    type: 'object',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxOAuthConfig'
  },
  developer: {
    title: 'Box Developer Token',
    type: 'object',
    tsType: 'import(\'#nuxt/box-sdk/types\').BoxDeveloperTokenConfig',
    description: 'Can be provided as Environment Variable - BOX_DEVELOPER_TOKEN | NUXT_BOX_DEVELOPER_TOKEN | NUXT_PUBLIC_BOX_DEVELOPER_TOKEN'
  },
  tokenStorage: {
    title: 'Nitro (unstorage) mount point',
    type: 'string'
  },
  managers: {
    title: 'Box Managers',
    type: 'object',
    description: 'In production, you provably don\'t need all the managers. Box by default include all the managers with client\nSo, by configuring `managers` you may decrease you bundle at a significant size',
    properties: {
      include: {
        type: 'array',
        tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames[]',
        items: {
          type: 'string',
          tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames'
        }
      },
      exclude: {
        type: 'array',
        tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames[]',
        items: {
          type: 'string',
          tsType: 'import(\'#nuxt/box-sdk/types\').BoxManagerNames'
        }
      }
    }
  },
  debug: {
    title: 'Debug',
    type: 'boolean',
    default: false
  }
};

export function addBoxSchema(nuxt = useNuxt()) {
  extendNuxtSchema(() => ({
    box: {
      $schema: {
        title: 'Box TypeScript SDK',
        properties: schemaProperties
      }
    },
    runtimeConfig: {
      box: {
        $schema: {
          title: 'Box Runtime Config',
          properties: objectPick(schemaProperties, ['ccg', 'jwt', 'oauth'])
        }
      },
      public: {
        box: {
          $schema: {
            title: 'Box Public Runtime Config',
            properties: objectPick(schemaProperties, ['debug', 'developer', 'auth'])
          }
        }
      }
    }
  }));
}
