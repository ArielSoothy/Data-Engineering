import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Use different base paths for development and production
    base: command === 'serve' ? '/' : '/Data-Engineering/',    build: {
      // Generate sourcemaps for easier debugging
      sourcemap: true,
      // Add rollup options for better compatibility
      rollupOptions: {
        output: {
          // Ensure assets have consistent names
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Make sure client-side routing works
          manualChunks: undefined
        }
      }
    }
  };
})
