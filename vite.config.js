import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // Change this back to '/' (or delete the base line entirely)
  plugins: [react()],
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
})