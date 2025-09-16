// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esta linha faz o servidor ficar visível para fora do container
    host: '0.0.0.0', 
    port: 5173,
    // Esta configuração ajuda o Hot-Reload (atualização automática) a funcionar corretamente
    hmr: {
      clientPort: 5173,
    },
  },
})