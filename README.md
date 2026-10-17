# Mirage Direction Two

Clean, decoupled Next.js 15 Monorepo architecture for **Web** and **Admin** portals without backend services, powered by the unified Mirage Pharma Design System.

## Architecture Overview

```text
mirage direction two/
├── apps/
│   ├── web/                    # Public Web Application (Next.js 15, App Router, Port 3000)
│   └── admin/                  # Clinical Admin Console (Next.js 15, App Router, Port 3001)
├── packages/
│   ├── config/                 # Unified Design System tokens (Colors, Typography, Fonts, WCAG Engine)
│   ├── ui/                     # Shared Atomic Components (Button, Card, Badge, Input, StatusPip)
│   ├── utils/                  # Shared Utility functions (cn tailwind-merge, formatting)
│   └── types/                  # Shared TypeScript Data Contracts & Interfaces
├── package.json                # Root Turborepo orchestration
├── pnpm-workspace.yaml         # PNPM Workspaces definition
└── turbo.json                  # Turbo pipeline configuration
```

## Design System Tokens & CSS

The project inherits the exact CSS Design System from Mirage Pharma:
- **Brand Colors:** Medical Blue (`#2878BC`), Corporate Navy (`#023368`), Vitality Green (`#35AB38`), Bio-Glass Cyan (`#308995`), Obsidian Dark Substrates (`#020F24`).
- **Glassmorphism & HUD:** `.hud-glass`, `.hud-glass-dark`, `.hud-glass-interactive`, `.telemetry-grid`, specular highlights, and GPU hardware acceleration.
- **Typography:** Plus Jakarta Sans (Headings), Inter (Clinical Body), Space Grotesk (Telemetry & Numbers).
- **Accessibility:** Reduced Motion and Reduced Transparency fallbacks built-in according to Web Interface Guidelines.

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Development Mode
```bash
pnpm dev
```
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3001](http://localhost:3001)

### 3. Build & Type Check
```bash
pnpm type-check
pnpm build
```
