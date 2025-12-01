# Listseerr

A modern web application built with React, TypeScript, and Vite featuring a comprehensive tech stack for building production-ready PWAs.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **pnpm** - Fast, disk space efficient package manager
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library
- **next-themes** - Theme management
- **cmdk** - Command menu component
- **dnd-kit** - Drag and drop toolkit
- **vite-plugin-pwa** - PWA support
- **vite-plugin-node-polyfills** - Node.js polyfills for browser
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

## Features

- ✅ TypeScript with strict mode
- ✅ PWA support with offline capabilities
- ✅ Dark/Light theme with system preference detection
- ✅ Drag and drop functionality
- ✅ Command menu (⌘K style)
- ✅ Accessible UI components from Radix UI
- ✅ Smooth animations with Framer Motion
- ✅ Path aliases (@/ for src/)
- ✅ ESLint configured with TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Lint

```bash
pnpm lint
```

## Project Structure

```
listseerr/
├── public/              # Static assets
│   └── vite.svg
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── command.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── lib/            # Utility functions
│   │   └── utils.ts
│   ├── App.tsx         # Main application component
│   ├── main.tsx        # Application entry point
│   ├── index.css       # Global styles with Tailwind
│   └── vite-env.d.ts   # TypeScript declarations
├── index.html
├── package.json
├── tsconfig.json       # TypeScript config (project references)
├── tsconfig.app.json   # TypeScript config for app
├── tsconfig.node.json  # TypeScript config for Vite
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── eslint.config.js    # ESLint configuration
```

## PWA Configuration

The application is configured as a Progressive Web App with:

- Service worker for offline support
- Web app manifest
- Automatic updates
- Asset caching strategies

### Adding PWA Icons

Add the following icon files to the `public/` directory:

- `pwa-192x192.png` - 192x192px icon
- `pwa-512x512.png` - 512x512px icon
- `apple-touch-icon.png` - 180x180px for Apple devices
- `favicon.ico` - Standard favicon
- `mask-icon.svg` - Safari pinned tab icon

## Customization

### Theme Colors

Edit CSS variables in `src/index.css` to customize the color scheme.

### Tailwind Configuration

Modify `tailwind.config.js` to extend the default theme or add custom utilities.

### Component Styling

All UI components use the `cn()` utility from `src/lib/utils.ts` which combines `clsx` and `tailwind-merge` for optimal class name handling.

## License

MIT
