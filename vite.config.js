import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/docs-da-ray/',
  plugins: [react()]
})
