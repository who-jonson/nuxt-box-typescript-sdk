import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  // alias,
  entries: [
    // './src/lib/mock'
  ],
  externals: [
    'ufo',
    'defu',
    'pathe',
    'unenv',
    'esbuild',
    'valibot',
    '@nuxt/scripts',
    '\'#nuxt-scripts\'',
    '\'#nuxt-scripts-utils\''
  ],
  failOnWarn: false
  // rollup: {
  //   esbuild: {
  //
  //   }
  // }
});
