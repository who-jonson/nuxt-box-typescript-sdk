import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: [
    'ufo',
    'defu',
    'pathe',
    'unenv',
    'esbuild',
    'valibot',
    'magic-string',
    '@nuxt/scripts',
    '@rollup/pluginutils',
    '\'#nuxt-scripts\'',
    '\'#nuxt-scripts-utils\''
  ],
  failOnWarn: false
});
