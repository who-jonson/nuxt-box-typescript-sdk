// copied from: https://github.com/box/box-typescript-sdk-gen/blob/main/src/box/developerTokenAuth.generated.ts
import { isObject } from '@whoj/utils-core';
import { tryUseNuxtApp, useRequestFetch } from '#imports';
import { BoxSdkError } from 'box-typescript-sdk-gen/lib/box/errors.js';
import type { TokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { Authentication } from 'box-typescript-sdk-gen/lib/networking/auth.generated.js';
import type { AccessToken } from 'box-typescript-sdk-gen/lib/schemas/accessToken.generated.js';
import { InMemoryTokenStorage } from 'box-typescript-sdk-gen/lib/box/tokenStorage.generated.js';
import type { NetworkSession } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';

export interface BoxTokenAuthConfig {
  readonly clientId?: string;
  readonly clientSecret?: string;
}

export interface BoxTokenAuthOptions {
  config?: BoxTokenAuthConfig;
  token?: string | AccessToken;
  tokenStorage?: TokenStorage;
}

class BoxTokenAuth implements Authentication {
  readonly tokenStorage: TokenStorage;

  constructor({ token, tokenStorage }: BoxTokenAuthOptions = {}) {
    this.tokenStorage = tokenStorage ?? new InMemoryTokenStorage({
      token: isObject<AccessToken>(token) ? token : { accessToken: token }
    });
  }

  async retrieveToken(_?: NetworkSession): Promise<AccessToken> {
    const token = await this.tokenStorage.get();
    if (!token?.accessToken?.length) {
      throw new BoxSdkError({ message: 'No access token is available!' });
    }
    return token!;
  }

  refreshToken(_?: NetworkSession): Promise<AccessToken> {
    throw new BoxSdkError({
      message: 'Token has expired. Please provide a new one.'
    });
  }

  async retrieveAuthorizationHeader(networkSession?: NetworkSession): Promise<string> {
    const token = await this.retrieveToken(networkSession);
    return ''.concat('Bearer ', token.accessToken!);
  }

  revokeToken(_?: NetworkSession): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  downscopeToken() {
    return Promise.resolve<AccessToken>(undefined);
  }
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function useBoxAuth(options?: BoxTokenAuthOptions): Authentication {
  const { routes } = tryUseNuxtApp()?.$config.public.box || {};

  if (!options?.token && !options?.tokenStorage && routes && routes.token) {
    return new (class extends BoxTokenAuth {
      override async refreshToken(networkSession?: NetworkSession) {
        const token = await useRequestFetch()<AccessToken>(routes.token.retrieve, { responseType: 'json', method: 'post' });
        return token?.accessToken
          ? token
          : super.refreshToken(networkSession);
      }
    })({
      tokenStorage: {
        get() {
          return useRequestFetch()<AccessToken>(routes.token.retrieve, { responseType: 'json', method: 'get' });
        }
      } as TokenStorage
    });
  }

  return new BoxTokenAuth(options);
}
