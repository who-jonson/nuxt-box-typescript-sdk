import { withBase } from 'ufo';
import type { GetAuthorizeUrlOptions } from 'box-typescript-sdk-gen/lib/box/oauth.generated.js';
import { defineEventHandler, getRequestURL, sendRedirect, useBoxClient, useNitroApp, useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  const client = useBoxClient('oauth');

  const options = {
    responseType: 'code',
    redirectUri: withBase(getRequestURL(event).origin, useRuntimeConfig().public.box.routes?.redirect.path)
  } satisfies GetAuthorizeUrlOptions;

  // @ts-ignore
  await useNitroApp().hooks.callHook('box:login:before', options);

  return sendRedirect(event, client.auth.getAuthorizeUrl(options));
});
