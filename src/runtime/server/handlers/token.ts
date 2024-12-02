import { createBoxSdkError } from './_';
import type { BoxAuthType } from '#nuxt/box-sdk/types';
import { appendResponseHeader, defineEventHandler, useBoxClient, useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const { auth, routes } = useRuntimeConfig(event).public.box;
    const authType = ((routes.token && routes.token.authType) || auth) as Exclude<BoxAuthType, 'dev'>;

    // @ts-ignore
    const client = useBoxClient(authType);
    const token = await (
      event.method === 'POST'
        ? client.auth.refreshToken()
        : client.auth.retrieveToken()
    );

    appendResponseHeader(event, 'content-type', 'application/json');

    return {
      ...token
    };
  }
  catch (err: any) {
    throw createBoxSdkError(err);
  }
});
