import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // Drop Vite's modulepreload polyfill: it is the only code in the bundle
    // that would call fetch(), and we would rather the audit be unambiguous.
    modulePreload: { polyfill: false },
  },
});
