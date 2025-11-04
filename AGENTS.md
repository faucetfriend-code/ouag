# Agent Guidelines for Unity Oracle Aggregator

## Build/Lint/Test Commands
- **Dev server**: `npm run dev` (network) | `npm run dev:local` (localhost)
- **Build**: `npm run build` (Next.js production)
- **Type check**: `npx tsc --noEmit`
- **Lint**: `npm run lint` (ESLint + Next.js) - run after changes
- **Test**: `node test-workflow.js` (workflow testing)
- **Android**: `npm run android:build` (build+sync) | `npm run android:open` (Android Studio)
- **Redis**: `npm run redis:init` (setup) | `npm run redis:clear` (reset)

## Code Style Guidelines
- **TypeScript**: Strict mode, ES2017 target, react-jsx transform, define interfaces for all props/data
- **React**: Functional components + hooks, 'use client' directive for client components
- **Naming**: PascalCase (components/interfaces), camelCase (vars/functions/files)
- **Imports**: Group React → external libs → internal modules (relative paths)
- **Structure**: One default export per file, JSDoc for functions/complex logic
- **Error Handling**: Try-catch async ops, validate inputs with TS interfaces, filter null/undefined
- **Styling**: Bootstrap classes, card-based layouts, non-null assertion (!) only after validation
- **Architecture**: Server/client separation (client components can't import server-only modules)