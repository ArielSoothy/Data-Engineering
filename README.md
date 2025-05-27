# Data Engineering

Interactive learning platform for Data Engineering topics including SQL and Python.

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

Create a `.env` file in the root directory with:

```
VITE_CLAUDE_API_KEY=your_api_key_here
```
```

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

- Main Site: https://arielsoothy.github.io/Data-Engineering/
- The site should also be accessible via https://arielsoothy.github.io/

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
