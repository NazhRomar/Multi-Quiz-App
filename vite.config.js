import { defineConfig } from 'vite'
import react from '@vitejs/react-swc' // (or '@vitejs/plugin-react' depending on your setup)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Multi-Quiz-App/', // 👈 ADD THIS LINE
})