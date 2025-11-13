import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import htmlEnvPlugin from './vite-html-env-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), htmlEnvPlugin()],

  // Path aliases to match your tsconfig.json
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  // Base path for deployment (matches your REACT_APP_BASE_PATH)
  base: process.env.VITE_BASE_PATH || '/ui',

  // Build configuration
  build: {
    outDir: 'build',
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'flow-vendor': ['@xyflow/react'],
        },
      },
    },
  },

  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth'],
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },

  // Preview server configuration
  preview: {
    port: 3000,
    open: '/ui/signup/basic',
  },

  // Environment variable prefix (VITE_ is the default, but being explicit)
  envPrefix: 'VITE_',
})