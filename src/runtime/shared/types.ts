import type { OAuthConfigInput } from 'box-typescript-sdk-gen/lib/box/oauth.generated.js';
import type { CcgConfigInput } from 'box-typescript-sdk-gen/lib/box/ccgAuth.generated.js';
import type { JwtConfigInput } from 'box-typescript-sdk-gen/lib/box/jwtAuth.generated.js';
import type { BaseUrlsInput } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';
import type { NetworkSessionInput } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';
import type { DeveloperTokenConfig } from 'box-typescript-sdk-gen/lib/box/developerTokenAuth.generated.js';

export type BoxAuthType = 'dev' | 'jwt' | 'ccg' | 'oauth';

export type BoxCcgConfig = Omit<CcgConfigInput, 'tokenStorage'>;

export type BoxJwtConfig = Omit<JwtConfigInput, 'tokenStorage'>;

export type BoxOAuthConfig = Omit<OAuthConfigInput, 'tokenStorage'>;

export type BoxDeveloperTokenConfig = DeveloperTokenConfig & { token: string };

export interface BoxNetworkOptions extends Omit<NetworkSessionInput, 'baseUrls'> {
  asUser?: string;
  baseUrls?: BaseUrlsInput;
  suppressNotifications?: boolean;
}

export interface BoxSdkOptions {
  /**
   * Default Auth to use
   *
   * When application running in development mode & provided `developer.token`
   * Then `developer.token` will be used as default auth
   *
   * RuntimeConfig - NUXT_PUBLIC_BOX_AUTH
   */
  auth?: BoxAuthType;

  /**
   * Client Credentials Grant Config
   *
   * RuntimeConfig Prefix - NUXT_BOX_CCG_
   */
  ccg?: BoxCcgConfig;

  /**
   * JwtAuth Config
   *
   * RuntimeConfig - NUXT_BOX_JWT
   * RuntimeConfig Prefix (when providing object) - NUXT_BOX_JWT_
   */
  jwt?: BoxJwtConfig | {
    /**
     * If provided Jwt config will be resolved from that file
     */
    configFile: `${string}.json`;
  };

  /**
   * Client Credentials Grant Config
   *
   * RuntimeConfig Prefix - NUXT_BOX_CCG_
   */
  oauth?: BoxOAuthConfig;

  /**
   * Box Developer Token
   *
   * Can be provided as Environment Variable - BOX_DEVELOPER_TOKEN | NUXT_BOX_DEVELOPER_TOKEN | NUXT_PUBLIC_BOX_DEVELOPER_TOKEN
   */
  developer?: BoxDeveloperTokenConfig;
}

export {};
