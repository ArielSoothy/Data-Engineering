import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Base path:
  // - On GitHub Pages, keep repo-specific base
  // - On Vercel or local dev, use '/'
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = command === 'serve' ? '/' : isGitHubPages ? '/Data-Engineering/' : '/';

  return {
    plugins: [react()],
    // Use different base paths for development and production
    base,
    build: {
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
