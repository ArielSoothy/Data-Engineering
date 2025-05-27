import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    // Make sure environment variables are properly loaded
    define: {
      // Explicitly expose the VITE_CLAUDE_API_KEY env variable
      'import.meta.env.VITE_CLAUDE_API_KEY': JSON.stringify(process.env.VITE_CLAUDE_API_KEY),
    },
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
