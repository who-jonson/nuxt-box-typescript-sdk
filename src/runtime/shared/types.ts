import type { Class } from '@whoj/utils-types';
import type { BoxClient } from 'box-typescript-sdk-gen/lib/client.generated.js';
import type { AgentOptions } from 'box-typescript-sdk-gen/lib/internal/utils.js';
import type { OAuthConfigInput } from 'box-typescript-sdk-gen/lib/box/oauth.generated.js';
import type { CcgConfigInput } from 'box-typescript-sdk-gen/lib/box/ccgAuth.generated.js';
import type { ProxyConfig } from 'box-typescript-sdk-gen/lib/networking/proxyConfig.generated.js';
import type { Interceptor } from 'box-typescript-sdk-gen/lib/networking/interceptors.generated.js';
import type { NetworkSessionInput } from 'box-typescript-sdk-gen/lib/networking/network.generated.js';
import type { JwtConfigInput, JwtConfigFile } from 'box-typescript-sdk-gen/lib/box/jwtAuth.generated.js';
import type { DeveloperTokenConfig } from 'box-typescript-sdk-gen/lib/box/developerTokenAuth.generated.js';
import type { BaseUrlsInput, BaseUrls } from 'box-typescript-sdk-gen/lib/networking/baseUrls.generated.js';

export type BoxAuthType = 'dev' | 'jwt' | 'ccg' | 'oauth';

type ConfigWithStorage<T> = Omit<T, 'tokenStorage'> & {
  tokenStorage?: string;
};

export type BoxCcgConfig = ConfigWithStorage<CcgConfigInput>;

export type BoxJwtConfig = ConfigWithStorage<JwtConfigInput>;

export type BoxOAuthConfig = ConfigWithStorage<OAuthConfigInput>;

export type BoxDeveloperTokenConfig = DeveloperTokenConfig & { token: string };

export type BoxManagerNames = keyof Omit<BoxClient, 'auth' | 'networkSession' | 'authorization' | 'withInterceptors' | 'withSuppressedNotifications' | 'withProxy' | 'withCustomBaseUrls' | 'withCustomAgentOptions' | 'withExtraHeaders' | 'withAsUserHeader'>;

export interface BoxNetworkOptions extends Omit<NetworkSessionInput, 'baseUrls'> {
  asUser?: string;
  baseUrls?: BaseUrlsInput;
  suppressNotifications?: boolean;
}

export interface ExtendedManager {
  withAsUserHeader(userId: string): this;
  withSuppressedNotifications(): this;
  withExtraHeaders(extraHeaders?: { [key: string]: string }): this;
  withCustomBaseUrls(baseUrlsInput: BaseUrlsInput): this;
  withProxy(config: ProxyConfig): this;
  withCustomAgentOptions(agentOptions: AgentOptions): this;
  withInterceptors(interceptors: Interceptor[]): this;
}

export type BoxManager<T extends Class<any>> = InstanceType<T> & ExtendedManager;

export interface BoxManagerNetworkSession extends Omit<NetworkSessionInput, 'baseUrls'> {
  baseUrls?: BaseUrls | BaseUrlsInput;
}

export interface BoxSdkOptions {
  /**
   * Default Auth to use
   *
   * When application running in development mode & provided `developer.token`
   * Then `developer.token` will be used as default auth
   *
   * Will throw Error if empty on production
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
   * Jwt Auth Config
   *
   * RuntimeConfig - NUXT_BOX_JWT
   * RuntimeConfig Prefix (when providing object) - NUXT_BOX_JWT_
   */
  jwt?: BoxJwtConfig | {
    /**
     * If provided Jwt config will be resolved from that file
     */
    configFile: `${string}.json`;
  } | {
    /**
     * Jwt config as JSON or JSON string
     */
    configJson: string | JwtConfigFile;
  };

  /**
   * OAuth 2.0  Config
   *
   * RuntimeConfig Prefix - NUXT_BOX_OAUTH_
   */
  oauth?: BoxOAuthConfig;

  /**
   * Box Developer Token
   *
   * Can be provided as Environment Variable - BOX_DEVELOPER_TOKEN | NUXT_BOX_DEVELOPER_TOKEN | NUXT_PUBLIC_BOX_DEVELOPER_TOKEN
   */
  developer?: BoxDeveloperTokenConfig;

  /**
   * Box Managers to register with client
   *
   * In production, you provably don't need all the managers. Box by default include all the managers with client
   * So, by configuring `managers` you may decrease you bundle at a significant size
   */
  managers?: {
    include?: Array<BoxManagerNames>;

    exclude?: Array<BoxManagerNames>;

    /**
     * @default true
     */
    composables?: boolean;
  };
}

export {};
