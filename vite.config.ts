
/// <reference types="vitest/config" />

import { defineConfig } from 'vite'
import path from 'node:path';
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
  },
  resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    
})
