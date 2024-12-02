import { createBoxSdkError } from './_';
import { defineEventHandler, getQuery, useBoxClient, useNitroApp } from '#imports';

export default defineEventHandler<{
  query: {
    code: string;
  };
}>(async (event) => {
  try {
    const client = useBoxClient('oauth');

    const response = await client.auth.getTokensAuthorizationCodeGrant(
      getQuery(event).code
    );

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:login:success', { event, response });
    return;
  }
  catch (e) {
    throw createBoxSdkError(e);
  }
});
