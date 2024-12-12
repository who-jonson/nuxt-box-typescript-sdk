import { consola } from 'consola';
import { createProxyServer } from 'httpxy';
import { ensurePrefix, ensureSuffix } from '@whoj/utils-core';
import { defineEventHandler, lazyEventHandler, useRuntimeConfig } from '#imports';

export default lazyEventHandler(() => {
  const proxy = createProxyServer({
    xfwd: false,
    secure: false,
    changeOrigin: true
  });

  const box = useRuntimeConfig().public.box;
  const pathRegex = (startsWith = false) => new RegExp(`${startsWith ? '^' : ''}${ensurePrefix('/', ensureSuffix('/', box.proxy))}(api|upload)`);

  return defineEventHandler(async ({ path, node: { req, res } }) => {
    const regexArr = pathRegex(true).exec(path);
    if (!regexArr) {
      return;
    }

    const token = await ((await import('../utils/auth')).useBoxAuth()?.retrieveToken());

    const target = regexArr[1] === 'api'
      ? 'https://api.box.com'
      : 'https://upload.box.com/api';

    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.path = proxyReq.path.replace(pathRegex(), '');
      proxyReq.setHeader('authorization', `Bearer ${token?.accessToken}`);

      if (import.meta.dev && box.debug) {
        consola.withTag('Box SDK').info(`Proxying '${path}' --->>> '${(new URL(target)).origin}${proxyReq.path}'`);
      }
    });

    try {
      await proxy.web(req, res, { target });
    }
    catch (error: any) {
      if (error?.code !== 'ECONNRESET') {
        throw error;
      }
    }
  });
});
