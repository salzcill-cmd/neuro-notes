<div align="center">

# NEURO NOTES

### Your AI-Native Second Brain

*Capture, connect, and create — powered by intelligence.*

![Version](https://img.shields.io/badge/version-0.1.0-8b5cf6?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-06b6d4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?style=for-the-badge&logo=tailwindcss)

<br />

[Features](#-features) &bull;
[Tech Stack](#-tech-stack) &bull;
[Architecture](#-architecture) &bull;
[Quick Start](#-quick-start) &bull;
[Project Structure](#-project-structure) &bull;
[Configuration](#-configuration) &bull;
[Deployment](#-deployment) &bull;
[Contributing](#-contributing)

---

**NeuroNotes** is a production-ready, AI-native knowledge management platform that transforms how you think, write, and organize. Built for creators, researchers, and teams who demand excellence from their tools.

</div>

---

## Features

<table>
<tr>
<td width="50%" valign="top">

### Rich Text Editor
Full-featured TipTap editor with **15+ extensions** — headings, bold, italic, strikethrough, code blocks, tables, task lists, links, images, highlights, text alignment, typography, and color.

### Knowledge Graph
Interactive node-based visualization powered by ReactFlow. See your notes, tags, and connections come alive with circular layouts, animated edges, zoom/pan, and a minimap.

### Task Management
Kanban board and list views with priority levels, status tracking, subtasks, progress indicators, and drag-and-drop organization.

</td>
<td width="50%" valign="top">

### Dashboard
At-a-glance view with statistics, recent notes, pending tasks, favorites, quick capture, and AI-powered suggestions.

### AI Assistant
Conversational AI interface with typing indicators, message history, quick actions, and intelligent content suggestions.

### Command Palette
Raycast-style command palette with fuzzy search, keyboard navigation, recent actions, and instant access to everything.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### Infinite Canvas
Spatial thinking with draggable cards, zoom/pan navigation, grid background, color coding, and freeform organization.

### Database View
Table and list views with inline cell editing, sorting, filtering, search, and real-time updates.

### Templates
8 built-in templates for meeting notes, project plans, journal entries, research, and more. Create your own custom templates.

</td>
<td width="50%" valign="top">

### Settings & Theming
Dark/light mode, accent colors, font size, editor preferences, auto-save configuration, and keyboard shortcuts.

### Sidebar Navigation
Nested folders, tags, favorites, recent notes, archived items, trash, and workspace switching.

### Responsive Design
Pixel-perfect on every screen — from mobile phones to ultrawide monitors. Collapsible sidebar, adaptive layouts, touch-friendly interactions.

</td>
</tr>
</table>

---

## Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|:---:|:---:|:---|
| **Framework** | Next.js 16 | App Router, Turbopack, Server Components, Standalone Output |
| **UI Library** | React 19 | Server Components, Hooks, Concurrent Features |
| **Language** | TypeScript 5 | Full type safety, strict mode |
| **Styling** | TailwindCSS 4 | Utility-first CSS, oklch colors, custom design tokens |
| **Editor** | TipTap v3 | ProseMirror-based, 15+ extensions, customizable toolbar |
| **Graph** | ReactFlow | Interactive node-based UI, minimap, controls |
| **State** | Zustand | Lightweight, persistent stores with localStorage |
| **Animation** | Framer Motion | Page transitions, layout animations, gesture support |
| **Icons** | Lucide React | 1000+ consistent, customizable icons |
| **ID** | Nanoid | URL-safe, compact unique identifiers |

</div>

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, providers, metadata)
│   ├── page.tsx            # Home page (AppLayout → MainContent)
│   └── globals.css         # Design tokens + base styles
│
├── components/
│   ├── ui/                 # Reusable UI primitives
│   │   ├── button.tsx      # CVA-based button (variants: default, outline, ghost, etc.)
│   │   ├── dialog.tsx      # Accessible modal with context provider
│   │   ├── dropdown-menu.tsx
│   │   ├── tooltip.tsx
│   │   ├── toast.tsx       # Notification system
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── scroll-area.tsx
│   │   ├── avatar.tsx
│   │   └── textarea.tsx
│   │
│   ├── layout/             # App shell & navigation
│   │   ├── AppLayout.tsx   # Root layout (sidebar, topbar, command palette)
│   │   ├── MainContent.tsx # View router (switches between all views)
│   │   ├── Topbar.tsx      # Top navigation bar
│   │   └── TabBar.tsx      # Multi-tab note editing
│   │
│   ├── sidebar/            # Sidebar navigation
│   │   └── Sidebar.tsx     # Folders, tags, favorites, workspace, new note
│   │
│   ├── editor/             # Rich text editor
│   │   ├── NoteEditor.tsx  # TipTap editor with 15+ extensions
│   │   └── EditorToolbar.tsx # Full formatting toolbar
│   │
│   ├── dashboard/          # Dashboard view
│   │   └── DashboardView.tsx
│   │
│   ├── notes/              # Note management
│   │   ├── NotesView.tsx   # Grid/list view with search & sort
│   │   ├── NoteEditorView.tsx # Full note editor with properties panel
│   │   └── TemplatesView.tsx # Template gallery
│   │
│   ├── graph/              # Knowledge graph
│   │   └── GraphView.tsx   # ReactFlow interactive graph
│   │
│   ├── tasks/              # Task management
│   │   └── TasksView.tsx   # Kanban + list views
│   │
│   ├── ai/                 # AI assistant
│   │   └── AIAssistantView.tsx
│   │
│   ├── canvas/             # Infinite canvas
│   │   └── CanvasView.tsx
│   │
│   ├── database/           # Database view
│   │   └── DatabaseView.tsx
│   │
│   ├── command-palette/    # Command palette
│   │   └── CommandPalette.tsx
│   │
│   └── settings/           # Settings
│       └── SettingsView.tsx
│
├── stores/                 # Zustand state management
│   ├── useAppStore.ts      # App-level state (theme, sidebar, tabs)
│   ├── useNoteStore.ts     # Notes, folders, current note
│   ├── useTaskStore.ts     # Tasks, subtasks, statuses
│   ├── useTagStore.ts      # Tags management
│   ├── useWorkspaceStore.ts # Workspaces
│   ├── useUIStore.ts       # UI state (toasts, panels, modals)
│   └── index.ts            # Re-exports
│
├── hooks/                  # Custom React hooks
│   ├── useAutoSave.ts      # Debounced auto-save
│   ├── useKeyboard.ts      # Keyboard shortcut bindings
│   ├── useClickOutside.ts  # Click outside detection
│   ├── useDebounce.ts      # Value debouncing
│   ├── useMediaQuery.ts    # Responsive breakpoint detection
│   ├── useLocalStorage.ts  # Persistent state
│   ├── useLongPress.ts     # Long press gesture
│   └── useInfiniteScroll.ts # Infinite scroll loading
│
├── types/                  # TypeScript type definitions
│   └── index.ts            # Note, Task, Tag, Workspace, etc.
│
├── constants/              # App constants & theme config
│   ├── index.ts            # Default values, shortcuts, statuses
│   └── themes.ts           # Color themes & accent palette
│
├── lib/                    # Utilities
│   └── utils.ts            # cn(), formatDate(), generateId(), etc.
│
└── styles/                 # Custom CSS
    └── editor.css          # TipTap editor typography styles
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20)
- **npm** 9+ or **yarn** 1.22+ or **pnpm** 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/salzcill-cmd/neuro-notes.git
cd neuro-notes

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it.

### Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## Configuration

### Design System

NeuroNotes uses a custom design system built on **oklch** color space for perceptually uniform colors:

```css
:root {
  --background: oklch(1 0 0);           /* Pure white */
  --foreground: oklch(0.145 0 0);       /* Near black */
  --primary: oklch(0.65 0.19 285);      /* Vibrant purple */
  --accent: oklch(0.65 0.19 285);       /* Primary accent */
  --muted: oklch(0.965 0 0);            /* Light gray */
  --border: oklch(0.922 0 0);           /* Subtle borders */
  --radius: 0.625rem;                    /* Rounded corners */
}
```

### State Management

All state is managed through **6 Zustand stores** with automatic localStorage persistence:

| Store | Responsibility |
|:---|:---|
| `useAppStore` | Theme, sidebar state, tabs, zen/focus mode |
| `useNoteStore` | Notes CRUD, folders, current note, favorites |
| `useTaskStore` | Tasks, subtasks, priorities, statuses |
| `useTagStore` | Tag management and assignment |
| `useWorkspaceStore` | Workspace switching |
| `useUIStore` | Toasts, panels, modals, active view |

### Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `Ctrl/Cmd + K` | Open command palette |
| `Ctrl/Cmd + N` | Create new note |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + Shift + F` | Search notes |
| `Escape` | Close modal / Exit zen mode |

---

## Deployment

### Docker

```bash
# Development
docker compose up

# Production
docker compose --profile production up
```

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/salzcill-cmd/neuro-notes)

### Self-Hosted

```bash
# Build
npm run build

# Start
npm run start
```

The build uses **standalone output** — all dependencies are bundled. Copy `.next/standalone` and `.next/static` to your server.

### Environment Variables

| Variable | Default | Description |
|:---|:---|:---|
| `PORT` | `3000` | Server port |
| `HOSTNAME` | `0.0.0.0` | Bind address |
| `NODE_ENV` | `development` | Environment mode |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |

---

## Project Stats

<div align="center">

| Metric | Value |
|:---:|:---|
| **Source Files** | 54 TypeScript/CSS files |
| **Components** | 30+ React components |
| **Custom Hooks** | 8 reusable hooks |
| **Zustand Stores** | 6 persistent stores |
| **TipTap Extensions** | 15+ editor extensions |
| **UI Primitives** | 13 design system components |
| **Built-in Templates** | 8 note templates |
| **Lines of Code** | ~18,000+ |

</div>

---

## Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript** strict mode
- **ESLint** with Next.js config
- **Functional components** with hooks
- **Zustand** for state management
- **TailwindCSS** for all styling (no inline styles)
- **CVA** for component variants

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with precision. Designed for velocity.**

*NeuroNotes — Think. Write. Connect.*

</div>
