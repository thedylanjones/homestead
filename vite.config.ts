// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,          // force port 3000
    strictPort: false,   // allow fallback to other ports
    hmr: { clientPort: 3000 },
    open: false
  },
  preview: {
    port: 3000,
    strictPort: true,
    open: false
  },
  optimizeDeps: { include: ['phaser'] }
})
