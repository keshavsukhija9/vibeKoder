const path = require('path')
const { defineConfig } = require('vitest/config')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['lib/**', 'modules/**/hooks/**', 'components/ui/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
