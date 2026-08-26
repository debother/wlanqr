import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Credentials must never reach a console or any storage API.
      'no-console': 'error',
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'WLANQR stores nothing.' },
        { name: 'sessionStorage', message: 'WLANQR stores nothing.' },
        { name: 'indexedDB', message: 'WLANQR stores nothing.' },
        { name: 'fetch', message: 'WLANQR sends nothing.' },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'document', property: 'cookie' },
        { object: 'window', property: 'localStorage' },
        { object: 'window', property: 'sessionStorage' },
        { object: 'window', property: 'indexedDB' },
        { object: 'window', property: 'fetch' },
      ],
    },
  },
);
