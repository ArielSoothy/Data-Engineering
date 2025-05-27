#!/bin/bash
# Deploy script for GitHub Pages

# Build the project
echo "Building for production..."
npm run build

# Create the necessary files for GitHub Pages SPA support
echo "Setting up GitHub Pages files..."

# Copy index.html to 404.html for SPA fallback
if [ -f "public/404.html" ]; then
  cp public/404.html dist/404.html
else
  cp dist/index.html dist/404.html
fi

# Copy CNAME to dist folder if it exists
if [ -f "public/CNAME" ]; then
  cp public/CNAME dist/
fi

echo "Deployment files prepared. Ready to push to GitHub Pages."
echo "Run these commands to deploy:"
echo "git add dist -f"
echo "git commit -m 'Deploy to GitHub Pages'"
echo "git subtree push --prefix dist origin gh-pages"
