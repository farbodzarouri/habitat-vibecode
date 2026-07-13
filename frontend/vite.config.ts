import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Spring Boot backend; avoids CORS in dev
      '/api': 'http://localhost:8080',
    },
  },
})
