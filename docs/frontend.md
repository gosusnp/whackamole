# Frontend Documentation

This document outlines the architecture, engineering standards, and component library for the `whackamole` frontend.

## Tech Stack

- **Framework**: [Preact](https://preactjs.com/) (with TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/) (aliased via `preact/compat`)
- **Routing**: [preact-iso](https://github.com/preactjs/preact-iso)
- **Icons**: [Lucide Preact](https://lucide.dev/guide/packages/lucide-preact)

## Engineering Standards

To maintain a clean and scalable codebase, we adhere to the following strict standards:

### 1. No Inline Styling
All styling must reside in CSS files. We use Tailwind CSS v4's `@theme` and `@layer components` to define our design system. 
- **Prohibited**: `className="flex p-4 bg-red-500"` (adhoc utility strings in JSX)
- **Encouraged**: `className="card-base"` (semantic classes defined in `index.css`)

### 2. Gold Standard Elements
Reusable UI primitives are located in `src/components/ui`. These are the "Gold Standard" elements.
- Components should be generic and highly reusable.
- Components must use type-only imports for Preact types (e.g., `import type { ComponentChildren } from 'preact'`).

### 3. Page Composition
Pages (`src/pages/`) must be composed **solely** of Gold Standard elements. 
- No ad hoc HTML elements or inline CSS within pages.
- If a new layout or container pattern is needed, it must first be promoted to a Gold Standard element in `src/components/ui`.

## Component Library

All "Gold Standard" elements are demoed at the `/design-elements` route.

### Available Components

| Component | Description |
| :--- | :--- |
| `Card` | Flexible container with optional `title` and `footer`. |
| `Columns` | Layout primitive for horizontal or vertical (`vertical` prop) stacking. |
| `Column` | Child component for `Columns` to define flexible grid items. |
| `Tabs` | Accessible tabbed interface powered by Radix UI. |

## CLI Integration

The frontend is built into a set of static files and embedded into the Go binary.

- **Build Output**: The `vite build` process is configured to output to `../internal/cli/static`.
- **Embedding**: The `internal/cli/ui.go` file uses Go's `embed` package to include this directory:
  ```go
  //go:embed static
  var staticFS embed.FS
  ```
- **Serving**: The `whack ui` command starts an HTTP server that serves these static files and provides a local API for data persistence.

## Development Workflow

### Running Locally
```bash
cd frontend
npm install
npm run dev
```

### Adding a New Element
1. Define the component's semantic styles in `src/index.css` under `@layer components`.
2. Create the component file in `src/components/ui/`.
3. Add a demonstration of the new element to `src/pages/DesignElements.tsx`.
4. Update this documentation if the component introduces new architectural patterns.
