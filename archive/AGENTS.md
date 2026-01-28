# Bilibili Gate - Developer Guide

This repository hosts the source code for "Bilibili Gate", a Bilibili UserScript/Extension built with React, Vite, and TypeScript.
This guide provides instructions for agentic coding agents to work effectively in this codebase.

## 1. Environment & Build Commands

This project uses **pnpm** as the package manager and **Turbo** for task orchestration.

### Common Commands

- **Install Dependencies**: `pnpm install`
- **Start Development Server**: `pnpm dev` (Runs Vite)
- **Build Production**: `pnpm build` (Runs SCSS build, typecheck, Vite build, and preview)
- **Lint**: `pnpm lint` (Runs oxlint and eslint)
- **Typecheck**: `pnpm typecheck` (Runs `tsc` via Turbo)
- **Format**: `pnpm exec prettier --write .`

### Testing (Vitest)

- **Run All Tests**: `pnpm test`
- **Run Single Test File**: `pnpm exec vitest run src/path/to/file.test.ts`
- **Run with UI**: `pnpm test:ui`

_Note: Always run `pnpm typecheck` and `pnpm test` before committing changes to ensure no regressions._

## 2. Code Style & Conventions

### Language & Syntax

- **Language**: TypeScript (Strict mode enabled).
- **Formatting**: Prettier with default settings (no semicolons, single quotes where applicable).
- **Indentation**: 2 spaces.
- **End of Line**: LF.

### Naming Conventions

- **Files/Directories**:
  - Components: PascalCase (e.g., `RecGrid`, `VideoCard`).
  - Modules/Utilities: kebab-case (e.g., `access-key`, `app-api.ts`).
  - Styles: `*.module.scss` for CSS modules.
- **Code**:
  - Variables/Functions: camelCase (e.g., `initHomepage`, `fetchData`).
  - React Components: PascalCase (e.g., `AppRoot`, `SettingsModal`).
  - Constants: SCREAMING_SNAKE_CASE (e.g., `HOST_API`, `IN_BILIBILI_HOMEPAGE`).
  - Interfaces/Types: PascalCase.

### Imports & Path Aliases

Use configured path aliases for cleaner imports. **Do not use relative paths** (e.g., `../../`) for project root modules.

- `$common` -> `src/common`
- `$components` -> `src/components`
- `$modules` -> `src/modules`
- `$main` -> `src/main`
- `$utility` -> `src/utility`

**Example:**

```typescript
// Good
import { appWarn } from '$common'
import { settings } from '$modules/settings'

// Bad
import { appWarn } from '../../common'
```

### Styling

- **UnoCSS**: Preferred for utility classes. Use `virtual:uno.css` import in entry.
- **CSS Modules**: Used for component-specific styles (`.module.scss`).
- **Emotion**: Available but prefer UnoCSS/CSS Modules for new code unless dynamic styling is strictly required.

### State Management

- **Valtio**: Used for global state management.
  - Reactive state with `proxy`.
  - Use `useSnapshot` in React components for reactivity.

### API & Network

- **Axios**: Primary HTTP client.
- **UserScript Adapter**: `axios-userscript-adapter` is used to bypass CORS via `GM_xmlhttpRequest`.
- **Wbi Signing**: Use `encWbi` from `$modules/bilibili/risk-control/wbi` when required by Bilibili API.
- **Error Handling**: Check `json.code === 0` for success. Handle non-zero codes gracefully.

## 3. Architecture & Patterns

### Directory Structure

- `src/components/`: Reusable UI components.
- `src/modules/`: Business logic, services, and feature-specific modules.
- `src/main/`: Page initialization logic (e.g., `homepage.ts`, `video-play-page.ts`).
- `src/utility/`: General helper functions.

### React Components

- Functional components with Hooks.
- Avoid Class components.
- Use `useMemo` and `useCallback` for performance optimization where appropriate, but don't over-optimize prematurely.

### UserScript Specifics

- The app detects the current page (Homepage, Search, Space, Video) and initializes the corresponding logic.
- See `src/index.ts` for the entry point dispatch logic.

## 4. Linting & Quality

- **ESLint**: Configured in `eslint.config.ts`. Extends `@magicdawn/eslint-config`.
- **Oxlint**: Used for fast linting.
- **Prettier**: Ensure all code is formatted before submission.

## 5. Agent Instructions

1.  **Read First**: Before modifying a file, read it to understand the context, existing imports, and style.
2.  **Verify**: After making changes, run `pnpm typecheck` to catch TS errors.
3.  **Test**: If modifying logic, add or update tests in `*.test.ts` files and run them using `pnpm exec vitest run <file>`.
4.  **No Blind Fixes**: If a lint/build error occurs, analyze it. Do not suppress errors with `// @ts-ignore` or `eslint-disable` unless absolutely necessary and justified.
5.  **New Dependencies**: Check `package.json` before adding new libraries. Reuse existing ones (e.g., `es-toolkit`, `dayjs`, `ahooks`).

## 6. Example: Running a Single Test

To verify changes in `src/utility/video.ts`:

```bash
# Run the specific test file
pnpm exec vitest run src/utility/video.test.ts
```

## 7. Configuration Files

- `package.json`: Scripts and dependencies.
- `tsconfig.json`: TypeScript configuration.
- `vite.config.ts`: Vite build configuration.
- `uno.config.ts`: UnoCSS configuration.
- `eslint.config.ts`: Linting rules.

---

_Generated for AI Agents working on Bilibili-Gate._
