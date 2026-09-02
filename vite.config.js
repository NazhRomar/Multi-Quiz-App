import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', // Change this back to '/' (or delete the base line entirely)
  plugins: [],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})