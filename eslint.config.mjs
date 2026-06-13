// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'dist/**', 'public/_nuxt/**'],
}).append({
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
});
