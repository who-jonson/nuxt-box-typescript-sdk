import { isObject } from '@whoj/utils-core';
import { useRequestEvent, useRuntimeConfig } from '#imports';
import { useBoxAuth as useBoxProxyAuth } from '../shared/auth';
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

// copied from: https://github.com/box/box-typescript-sdk-gen/blob/main/src/box/developerTokenAuth.generated.ts
export class BoxTokenAuth implements Authentication {
  readonly tokenStorage: TokenStorage;

  constructor({ token, tokenStorage }: BoxTokenAuthOptions = {}) {
    this.tokenStorage = tokenStorage ?? new InMemoryTokenStorage({
      token: isObject<AccessToken>(token) ? token : { accessToken: token ?? '' }
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
  if ((!options || (!options.token && !options.tokenStorage)) && useRuntimeConfig().public.box.proxy) {
    if (import.meta.server) {
      return useBoxProxyAuth({
        tokenStorage: useRequestEvent().context.$box.resolveTokenStorage()
      });
    }
    return new BoxTokenAuth({ token: 'token' });
  }

  return new BoxTokenAuth(options);
}
