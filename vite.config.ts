import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Make sure environment variables are properly loaded
  define: {
    // Explicitly expose the VITE_CLAUDE_API_KEY env variable
    'import.meta.env.VITE_CLAUDE_API_KEY': JSON.stringify(process.env.VITE_CLAUDE_API_KEY),
  },
})
