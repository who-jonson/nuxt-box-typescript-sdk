import { useBoxAuth } from './auth';
import { useRuntimeConfig } from '#imports';
import { objectKeys } from '@whoj/utils-core';
import { BoxClient } from '#nuxt/box-sdk/client';
import { isAuthentication } from '#nuxt/box-sdk/utils';
import type { UseBoxAuthConfigInput, UseBoxAuthReturns } from './auth';
import type { BoxAuthType, BoxNetworkOptions } from '#nuxt/box-sdk/types';
import { BaseUrls } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';
import { NetworkSession } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { NetworkSessionInput } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxClient<T extends Authentication = Authentication>(auth?: T, session?: NetworkSession | BoxNetworkOptions): BoxClient<T>;
export function useBoxClient<T extends BoxAuthType = BoxAuthType>(auth?: T, authConfig?: UseBoxAuthConfigInput<T>, session?: NetworkSession | BoxNetworkOptions): BoxClient<UseBoxAuthReturns<T>>;
export function useBoxClient(...args: any[]) {
  const client = new BoxClient({
    auth: isAuthentication(args[0])
      ? args[0]
      : useBoxAuth(args[0], args[1])!,

    networkSession: netWorkSession(
      isAuthentication(args[0])
        ? args[1]
        : args[2]
    )
  });

  if (import.meta.dev) {
    return client.withInterceptors([
      {
        beforeRequest(options) {
          if (useRuntimeConfig().public.box.debug) {
            console.log('Box Request: >>>  ', options.url);
          }
          return options;
        },
        afterRequest(response) {
          if (useRuntimeConfig().public.box.debug) {
            console.log('Box Response: >>>  ', response.data);
          }
          return response;
        }
      }
    ]);
  }

  return client;
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxCcgClient(authConfig?: UseBoxAuthConfigInput<'ccg'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('ccg', authConfig, session);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxJwtClient(authConfig?: UseBoxAuthConfigInput<'jwt'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('jwt', authConfig, session);
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxOAuthClient(authConfig?: UseBoxAuthConfigInput<'oauth'>, session?: NetworkSession | BoxNetworkOptions) {
  return useBoxClient('oauth', authConfig, session);
}

/**
 * @internal
 */
function netWorkSession(session?: NetworkSession | BoxNetworkOptions): NetworkSession | undefined {
  if (!session) {
    return;
  }

  if (session instanceof NetworkSession) {
    return session;
  }

  const { asUser, suppressNotifications, ...fields } = session;
  const headers = { ...(fields.additionalHeaders || {}) };

  if (asUser) {
    headers['As-User'] = asUser;
  }
  if (suppressNotifications) {
    headers['Box-Notifications'] = 'off';
  }

  if (objectKeys(headers).length) {
    fields.additionalHeaders = headers;
  }

  if (fields.baseUrls) {
    fields.baseUrls = new BaseUrls(fields.baseUrls);
  }

  return new NetworkSession(fields as NetworkSessionInput);
}
