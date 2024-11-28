import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
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
});
