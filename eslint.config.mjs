// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: {
      indent: 2,
      semi: true,
      quotes: 'single',
      commaDangle: 'never'
    }
  },
  dirs: {
    src: [
      './playground'
    ]
  }
})
  .append(
    {
      rules: {
        'eqeqeq': 'warn',
        'import/order': 'off',
        'semi': [2, 'always'],
        'require-await': 'warn',
        'quotes': ['error', 'single'],
        'comma-dangle': ['error', 'never'],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
      }
    }
  );
