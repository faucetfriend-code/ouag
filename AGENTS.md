# Agent Guidelines for Unity Oracle Aggregator

## Build/Lint/Test Commands
- **Dev server**: `npm run dev` (network) | `npm run dev:local` (localhost)
- **Build**: `npm run build` (Next.js production build)
- **Type check**: `npx tsc --noEmit` (TypeScript validation)
- **Lint**: `npm run lint` (ESLint + Next.js) - run after code changes
- **Test**: `node test-workflow.js` (workflow testing) | No unit test framework configured
- **Android**: `npm run android:build` (build+sync) | `npm run android:open` (Android Studio)
- **Redis**: `npm run redis:init` (setup) | `npm run redis:clear` (reset)

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, ES2017 target, react-jsx transform, define interfaces for all props/data structures
- **React**: Functional components with hooks, add 'use client' directive for client-side components only
- **Naming**: PascalCase (components/interfaces), camelCase (variables/functions/files), kebab-case (CSS classes)
- **Imports**: Group React → external libs → internal modules (relative paths), use path aliases (@/*)
- **Structure**: One default export per file, JSDoc comments for complex logic, file-level JSDoc for components
- **Error Handling**: Try-catch for async operations, validate inputs with TypeScript interfaces, filter null/undefined
- **Styling**: Bootstrap classes for responsive UI, maintain card-based layouts, avoid inline styles
- **Architecture**: Server/client separation (client components can't import server-only modules), use server actions for data mutations