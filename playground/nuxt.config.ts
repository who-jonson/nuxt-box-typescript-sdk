export default defineNuxtConfig({

  modules: ['../src/module'],

  devtools: { enabled: true },

  runtimeConfig: {
    box: {

    }
  },
  // app: {
  //   head: {
  //     script: [
  //       { src: '~~box-typescript-sdk-gen/lib/bundle.js', async: true }
  //     ]
  //   }
  // },

  compatibilityDate: '2024-11-25',

  vite: {
    define: {
      __DEV__: JSON.stringify(true)
    }
  },

  telemetry: {
    enabled: false
  },

  boxSdk: {

  },

  scripts: {
    debug: true
    // registry: {
    //   boxSdk: {
    //     exports: ['BoxClient', 'BoxDeveloperTokenAuth']
    //   }
    // }
  }
});
