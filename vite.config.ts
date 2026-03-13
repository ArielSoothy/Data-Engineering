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

  // Helper: creates a Vite plugin that spawns a CLI subprocess for /api/<name>
  function createCliPlugin(
    name: string,
    buildArgs: (model: string) => { cmd: string; args: string[] },
    envCleanup?: (env: Record<string, string | undefined>) => void,
    parseOutput?: (stdout: string) => string,
  ) {
    return {
      name,
      configureServer(server: import('vite').ViteDevServer) {
        server.middlewares.use(`/api/${name}`, (req: import('http').IncomingMessage, res: import('http').ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end();
            return;
          }
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            let prompt = '';
            let model = '';
            try {
              const parsed = JSON.parse(body) as { prompt?: string; model?: string };
              prompt = parsed.prompt ?? body;
              model = parsed.model ?? '';
            } catch {
              prompt = body;
            }

            const cleanEnv = { ...process.env };
            if (envCleanup) envCleanup(cleanEnv);

            const { cmd, args } = buildArgs(model);
            const child = spawn(cmd, args, {
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

              let text = parseOutput ? parseOutput(stdout) : stdout;
              // Check for error markers in parsed output
              if (parseOutput) {
                try {
                  const parsed = JSON.parse(stdout);
                  if (parsed.is_error || parsed.type === 'error') {
                    res.statusCode = 500;
                    res.end(parsed.error || parsed.result || 'CLI error');
                    return;
                  }
                } catch { /* not JSON — use parsed text */ }
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
  }

  // Claude CLI — uses npx @anthropic-ai/claude-code with JSON output
  const claudeCliPlugin = createCliPlugin(
    'claude-cli',
    (model) => {
      const args = ['@anthropic-ai/claude-code', '-p', '-', '--output-format', 'json'];
      if (model) args.push('--model', model);
      return { cmd: 'npx', args };
    },
    (env) => {
      delete env.CLAUDECODE;
      delete env.ANTHROPIC_API_KEY;
    },
    (stdout) => {
      try {
        const parsed = JSON.parse(stdout);
        return parsed.result || stdout;
      } catch { return stdout; }
    },
  );

  // Codex CLI — uses codex exec with stdin prompt
  const codexCliPlugin = createCliPlugin(
    'codex-cli',
    (model) => {
      const args = ['exec', '-'];
      if (model) args.push('--model', model);
      return { cmd: 'codex', args };
    },
  );

  // Gemini CLI — uses gemini -p with stdin prompt
  const geminiCliPlugin = createCliPlugin(
    'gemini-cli',
    (model) => {
      const args = ['-p', '-'];
      if (model) args.push('-m', model);
      return { cmd: 'gemini', args };
    },
  );

  return {
    plugins: [
      react(),
      claudeCliPlugin,
      codexCliPlugin,
      geminiCliPlugin,
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
      sourcemap: false,
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
