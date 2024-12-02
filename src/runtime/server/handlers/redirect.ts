import { defineEventHandler, getQuery, useBoxClient, useNitroApp } from '#imports';

export default defineEventHandler<{
  query: {
    code: string;
  };
}>(async (event) => {
  const client = useBoxClient('oauth');

  const token = await client.auth.getTokensAuthorizationCodeGrant(
    getQuery(event).code
  );

  // @ts-ignore
  await useNitroApp().hooks.callHook('box:login:success', token);
});
