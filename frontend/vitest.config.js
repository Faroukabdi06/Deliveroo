import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // for React components
    setupFiles: './src/setupTests.js', // optional, if you have mocks or global setups
    server: {
      deps: {
        inline: ['jsdom'], // fixes ES module issue with jsdom
      },
    },
  },
});
