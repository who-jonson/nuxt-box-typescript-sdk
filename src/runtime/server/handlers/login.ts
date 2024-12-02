import { withBase } from 'ufo';
import { createBoxSdkError } from './_';
import type { GetAuthorizeUrlOptions } from 'box-typescript-sdk-gen/lib/box/oauth.generated.js';
import { getRequestURL, defineEventHandler, sendRedirect, useBoxClient, useNitroApp, useRuntimeConfig } from '#imports';

export default defineEventHandler(async (event) => {
  try {
    const client = useBoxClient('oauth');

    const options = {
      redirectUri: withBase(useRuntimeConfig().public.box.routes?.redirect.path, getRequestURL(event).origin)
    } satisfies GetAuthorizeUrlOptions;

    // @ts-ignore
    await useNitroApp().hooks.callHook('box:login:before', { event, options });

    return sendRedirect(event, client.auth.getAuthorizeUrl(options));
  }
  catch (err) {
    throw createBoxSdkError(err);
  }
});
