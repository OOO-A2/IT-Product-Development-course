import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['json-summary', 'text'],
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    }
  }
})
