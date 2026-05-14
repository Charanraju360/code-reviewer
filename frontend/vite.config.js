import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
})
