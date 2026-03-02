import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { exec } from 'child_process'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Base path:
  // - On GitHub Pages, keep repo-specific base
  // - On Vercel or local dev, use '/'
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = command === 'serve' ? '/' : isGitHubPages ? '/Data-Engineering/' : '/';

  const claudeCliPlugin = {
    name: 'claude-cli',
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/api/claude-cli', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          let prompt = '';
          try {
            const parsed = JSON.parse(body) as { prompt?: string };
            prompt = parsed.prompt ?? body;
          } catch {
            prompt = body;
          }
          const child = exec('claude --output-format text', (error, stdout, stderr) => {
            if (error) {
              res.statusCode = 500;
              res.end(stderr || error.message);
              return;
            }
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(stdout);
          });
          if (child.stdin) {
            child.stdin.write(prompt);
            child.stdin.end();
          }
        });
      });
    }
  };

  return {
    plugins: [react(), claudeCliPlugin],
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
