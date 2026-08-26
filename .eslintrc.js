module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
    // NOTE: '@typescript-eslint/no-unused-vars' was removed – the
    // @typescript-eslint/eslint-plugin package is not installed, so referencing
    // the rule crashed `next build` linting for EVERY file.
  },
}