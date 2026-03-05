import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { spawn } from 'child_process'

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

          // Remove CLAUDECODE env to prevent "nested session" error (pattern from AICouncil)
          // Remove ANTHROPIC_API_KEY so CLI uses subscription mode (free)
          const cleanEnv = { ...process.env };
          delete cleanEnv.CLAUDECODE;
          delete cleanEnv.ANTHROPIC_API_KEY;

          const child = spawn('npx', [
            '@anthropic-ai/claude-code',
            '-p', '-',
            '--output-format', 'json',
          ], {
            shell: '/bin/zsh',
            timeout: 120000,
            env: cleanEnv,
          });

          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
          child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

          child.on('error', (error: Error) => {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
          });

          child.on('close', (code: number | null) => {
            if (code !== 0 && !stdout) {
              res.statusCode = 500;
              res.end(stderr || `Process exited with code ${code}`);
              return;
            }

            // Parse JSON response from CLI
            let text = stdout;
            try {
              const parsed = JSON.parse(stdout);
              if (parsed.is_error || parsed.type === 'error') {
                res.statusCode = 500;
                res.end(parsed.error || parsed.result || 'CLI error');
                return;
              }
              text = parsed.result || stdout;
            } catch {
              // Not JSON — use raw stdout
            }

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(text);
          });

          child.stdin.write(prompt);
          child.stdin.end();
        });
      });
    }
  };

  return {
    plugins: [
      react(),
      claudeCliPlugin,
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['vite.svg', 'icon-192.png', 'icon-512.png'],
        manifest: {
          name: 'DE Prep - Data Engineer Interview Prep',
          short_name: 'DE Prep',
          description: 'Master SQL & Python for Meta Data Engineer interviews',
          theme_color: '#1e40af',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /\/data\/.*\.json$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'question-data',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 }
              }
            }
          ]
        }
      })
    ],
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
