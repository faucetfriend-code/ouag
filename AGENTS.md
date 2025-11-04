# Agent Guidelines for Unity Oracle Aggregator

## Build Commands
- **Dev server**: `npm run dev` (Next.js on 0.0.0.0) | `npm run dev:local` (localhost only)
- **Build**: `npm run build` (Next.js production build)
- **Type check**: `npx tsc --noEmit` (TypeScript validation)
- **Lint**: `npm run lint` (ESLint with Next.js config) - run after code changes
- **Test**: No formal test framework - use `node test-workflow.js` for workflow testing
- **Android**: `npm run android:build` (build + sync) | `npm run android:open` (open in Android Studio)
- **Redis**: `npm run redis:init` (setup) | `npm run redis:clear` (reset)

## Code Style Guidelines

### TypeScript & React
- Strict TypeScript enabled, define interfaces for all props/data structures
- Functional components with hooks, add 'use client' directive for client-side components
- Target ES2017, ES modules, JSX transform: react-jsx
- Use JSDoc comments for function documentation and complex logic

### Naming & Structure
- **Components/Interfaces**: PascalCase (TokenCard, TradingPost)
- **Variables/Functions/Files**: camelCase (organizeDataByToken, summarization.ts)
- Group imports: React, external libs, then internal modules with relative paths
- One default export per file, handle optional props safely with TypeScript

### Error Handling & Styling
- Try-catch for async operations, validate inputs with TypeScript interfaces
- Bootstrap classes for responsive UI, maintain card-based layouts
- Filter null/undefined values before processing arrays
- Use non-null assertion operator (!) only after proper validation