# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based interactive learning platform for Data Engineering topics, designed specifically for Microsoft technical interview preparation. The app features SQL and Python exercises, practice questions, AI-powered feedback, and progress tracking.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (localhost:5173)
- `npm run build` - Build for production (TypeScript compile + Vite build)
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages

### Testing
No test framework is currently configured. Check if tests need to be added before implementing new features.

## Architecture Overview

### Frontend Structure
- **React 18** with TypeScript and Vite
- **Routing**: Dynamic router selection (BrowserRouter for local, HashRouter for GitHub Pages)
- **State Management**: React Context API (`src/context/AppContext.tsx`) for user progress, timer sessions, and preferences
- **Styling**: Tailwind CSS with dark mode support
- **Components**: Modular structure in `src/components/` with tab-based navigation

### Key Architectural Components

#### Context System (`src/context/AppContext.tsx`)
- Manages user progress across all categories (SQL, Python, Azure, etc.)
- Handles timer sessions for practice
- Manages user preferences (dark mode, timer settings)
- Persists data to localStorage with automatic sync

#### AI Integration (`src/services/claudeApi.ts`)
- Dual AI provider support: Claude (Anthropic) and Gemini (Google)
- Provider selection via `VITE_AI_PROVIDER` environment variable
- Fallback to mock feedback when API unavailable
- Comprehensive error handling for API failures

#### Serverless API Routes
- **Claude Proxy** (`api/claudeProxy.ts`): Vercel/Netlify serverless function for Anthropic API
- **Gemini Proxy** (`api/geminiProxy.ts`): Serverless function for Google Gemini API
- Both support runtime API key configuration via headers

#### Data Layer
- JSON-based question banks in `src/data/` and `public/data/`
- Categories: SQL basics/advanced, Python basics/advanced, Azure services, mock interviews
- Progress tracking with completion status and timestamps

### Deployment Architecture

#### Multi-Platform Support
- **GitHub Pages**: Automatic deployment via GitHub Actions, uses HashRouter
- **Vercel**: Serverless functions for AI APIs, uses BrowserRouter
- **Local Development**: Proxy setup for API routes

#### Environment Configuration
- Development: API calls routed to `localhost:3000/api/*`
- Production: Relative paths `/api/*` for serverless functions
- Base path automatically configured based on deployment target

## Important Development Notes

### Router Configuration
The app automatically selects routing strategy based on deployment:
```typescript
const Router = isGitHubPages ? HashRouter : BrowserRouter;
```

### AI Provider Configuration
- Set `VITE_AI_PROVIDER=gemini` or `VITE_AI_PROVIDER=claude`
- API keys: `GEMINI_API_KEY` or `CLAUDE_API_KEY` in environment
- Models configurable via `VITE_GEMINI_MODEL` or `VITE_CLAUDE_MODEL`

### State Persistence
- User progress automatically saved to localStorage
- Timer sessions and preferences persist across sessions
- Context provides methods for progress tracking and statistics

### Component Patterns
- Tab-based navigation with responsive design
- Question components support both practice and assessment modes
- AI feedback integration with loading states and error handling

## Code Quality Standards

- TypeScript strict mode enabled
- ESLint configuration for React and TypeScript
- Tailwind CSS for consistent styling
- Interface definitions for all major data structures

## Environment Variables

### Required for AI Features
- `GEMINI_API_KEY` or `CLAUDE_API_KEY` - API keys for AI feedback
- `VITE_AI_PROVIDER` - Choose 'gemini' or 'claude'

### Optional Configuration
- `VITE_GEMINI_MODEL` - Gemini model (default: gemini-1.5-flash)
- `VITE_CLAUDE_MODEL` - Claude model (default: claude-3-haiku-20240307)
- `GITHUB_PAGES` - Set to 'true' for GitHub Pages builds