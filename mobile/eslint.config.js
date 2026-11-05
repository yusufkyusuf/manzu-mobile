// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Endpoints the mobile app must never call (see PLAN.md §4). esquery regexes can't contain '/', so '.' stands in.
const message = 'Forbidden endpoint for the mobile app (see PLAN.md §4).';
const FORBIDDEN = ['pharmacy.change-password', 'auth.verify', 'pharmacy.sales.:'];
const forbiddenSelectors = [
  ...FORBIDDEN.flatMap((re) => [
    { selector: `Literal[value=/${re}/]`, message },
    { selector: `TemplateElement[value.raw=/${re}/]`, message },
  ]),
  // `/api/pharmacy/sales/${saleId}` (no backend route)
  { selector: 'TemplateElement[value.raw=/pharmacy.sales.$/]', message },
];

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...forbiddenSelectors],
    },
  },
]);
