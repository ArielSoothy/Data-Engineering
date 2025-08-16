### Vercel Deployment

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Set Environment Variables in Vercel Project Settings:
   - `VITE_AI_PROVIDER=gemini`
   - `GEMINI_API_KEY=...` (for Gemini)
   - (Optional) `CLAUDE_API_KEY=...` if switching provider
   - (Optional) `GITHUB_PAGES=false`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Serverless routes: `api/geminiProxy.ts`, `api/claudeProxy.ts` are auto-detected by Vercel.

## AI Provider Configuration

This app supports multiple AI providers via serverless API routes and can run on Vercel:

- Set `VITE_AI_PROVIDER` to `gemini` (default) or `claude`.
- For Gemini (Gemini 1.5 Flash Free):
  - Create an environment variable `GEMINI_API_KEY` in Vercel project settings.
  - Optionally set `GEMINI_MODEL` (defaults to `gemini-1.5-flash`).
- For Claude:
  - Create `CLAUDE_API_KEY` in Vercel project settings.
  - Optionally set `CLAUDE_MODEL`.

Local dev uses `http://localhost:3000/api/*` proxies; production uses relative `/api/*` paths.

If deploying to GitHub Pages, set `GITHUB_PAGES=true` prior to build to keep repo base path.
# Data Engineering Learning Platform

🎯 **Interactive Microsoft Technical Interview Preparation** | Built for Google/Reichman AI & Deep Learning Course

*Professional-grade React + AI learning platform with 115+ curated questions, browser-based code execution, and dual AI feedback (Claude + Gemini)*

## 🏆 Project Showcase

**Live Demo:** https://arielsoothy.github.io/Data-Engineering/
**Technologies:** React 18, TypeScript, Vite, Tailwind CSS, Monaco Editor, Pyodide, SQL.js
**AI Integration:** Claude (Anthropic) + Gemini (Google) with serverless API architecture
**Course Context:** Google/Reichman University AI & Deep Learning Program

### Key Technical Achievements
- 🧠 **Dual AI Provider Architecture** - Seamless failover between Claude and Gemini APIs
- 💻 **Browser Code Execution** - Run Python and SQL directly in browser without servers
- 📱 **Enterprise UX** - Responsive design with progress tracking and dark mode
- 🚀 **Multi-Platform Deployment** - GitHub Pages + Vercel with serverless functions

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This is a React-based learning platform for Data Engineering concepts, including SQL and Python exercises, with an interactive interface.

## Features

- Dashboard with overview of topics
- SQL basics and advanced exercises
- Python basics and advanced exercises
- Interactive code editors
- Dark mode support
- Responsive design for all devices

## Development

### Prerequisites

- Node.js 18+ and npm

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

### Environment Variables

Create a `.env` file in the root directory (see `.env.example` for a template) and provide your Anthropic API key:

```
CLAUDE_API_KEY=your_api_key_here
VITE_CLAUDE_API_KEY=your_api_key_here

# Optional: choose which Claude model to use
CLAUDE_MODEL=claude-3-haiku-20240307
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
```

The client loads `VITE_CLAUDE_API_KEY` and `VITE_CLAUDE_MODEL` at build time. All requests go through `/api/claudeProxy`, which uses `CLAUDE_API_KEY` and `CLAUDE_MODEL` on the server.

### Serverless Deployment

Deploy to Vercel or Netlify and add a secret named `CLAUDE_API_KEY` in your project settings. The `api/claudeProxy.ts` file will be automatically picked up as a serverless function.

## Deployment

### GitHub Pages Deployment

The site is configured to deploy automatically to GitHub Pages when changes are pushed to the main branch.

#### Automatic Deployment

When you push to the main branch, the GitHub Actions workflow will:
1. Build the project
2. Configure Single-Page Application routing for GitHub Pages
3. Deploy to GitHub Pages

#### Manual Deployment

You can manually deploy using:

```
npm run deploy
```

This will:
1. Build the project
2. Set up files for GitHub Pages deployment
3. Provide instructions for pushing to the gh-pages branch

### Accessing the Site

- **Main Site:** https://arielsoothy.github.io/Data-Engineering/
- **Alternative URL:** https://arielsoothy.github.io/

### 📢 LinkedIn/Professional Sharing

**Project Highlights for Social Media:**
- 🎯 Built comprehensive Microsoft Data Engineer interview prep platform
- 🧠 Integrated dual AI providers (Claude + Gemini) with seamless failover
- 💻 Implemented browser-based Python and SQL execution environments
- 📱 Created responsive, accessible UX with progress tracking
- 🚀 Deployed multi-platform architecture (GitHub Pages + Vercel serverless)

**Technologies Showcase:** React 18, TypeScript, AI APIs, Monaco Editor, WebAssembly (Pyodide), SQL.js, Tailwind CSS

## Troubleshooting

### 404 Errors after Refresh

If you're experiencing 404 errors after refreshing the page on GitHub Pages:

1. Make sure you're using the HashRouter in production (automatic in the current setup)
2. Check that the 404.html file is properly set up
3. Ensure the base path in `vite.config.ts` is correctly set to `/Data-Engineering/` for production builds

### Local Development Issues

If the local development server isn't working:

1. Make sure the `base` path in `vite.config.ts` is set correctly based on the environment
2. Check that you're using the BrowserRouter for local development
3. Restart the development server with `npm run dev`
  },
})
```
