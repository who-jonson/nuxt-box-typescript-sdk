import { memoize } from './_';
import { useBoxAuth } from '#imports';
import type { UseBoxAuthConfigInput } from './auth';
import { isObject, objectKeys } from '@whoj/utils-core';
import type { BoxAuthType, BoxNetworkOptions } from './types';
import { BoxClient } from 'box-typescript-sdk-gen/lib/client.generated.js';
import { BaseUrls } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';
import { NetworkSession } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { NetworkSessionInput } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';

export function boxClientConstructor(_constructor?: (client: BoxClient) => BoxClient) {
  return memoize(useBoxClient, _constructor);
}

export function useBoxClient<T extends Authentication>(auth: T, session?: NetworkSession | BoxNetworkOptions): BoxClient;
export function useBoxClient<T extends BoxAuthType>(auth?: T, authConfig?: UseBoxAuthConfigInput<T>, session?: NetworkSession | BoxNetworkOptions): BoxClient;
export function useBoxClient(...args: any[]): BoxClient {
  if (isObject<Authentication>(args[0])) {
    return new BoxClient({
      auth: args[0],
      networkSession: netWorkSession(args[1])
    });
  }

  return new BoxClient({
    auth: useBoxAuth(args[0], args[1]),
    networkSession: netWorkSession(args[2])
  });
}

/**
 * @internal
 */
function netWorkSession(session?: NetworkSession | BoxNetworkOptions): NetworkSession {
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
