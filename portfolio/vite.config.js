import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://kellis5137.github.io/maker-portfolio/
  base: '/maker-portfolio/',
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['server-c740'],
  },
})
