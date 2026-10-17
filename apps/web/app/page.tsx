import { Button, Badge, Card, StatusPip } from '@mirage/ui';

export default function WebHomePage() {
  return (
    <main className="min-h-screen telemetry-grid flex flex-col justify-between p-6 md:p-12">
      {/* Top Navigation Bar / HUD Shell */}
      <header className="hud-glass rounded-2xl px-6 py-4 flex items-center justify-between border border-white/80 shadow-hud-glass">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-heading font-bold text-lg text-brand-navy tracking-tight">
            MIRAGE <span className="text-brand-primary font-normal text-xs uppercase tracking-widest ml-1">Direction Two</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <StatusPip status="optimal" label="GxP Protocol Active" />
          <Button variant="outline" size="sm" asChild>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer">
              Admin Console →
            </a>
          </Button>
        </div>
      </header>

      {/* Hero Skeleton / Structural Container */}
      <section className="my-16 max-w-4xl mx-auto w-full text-center space-y-6">
        <div className="flex justify-center">
          <Badge variant="cyan" size="md">
            Next.js 15 • Frontend Architecture
          </Badge>
        </div>
        <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
          Values-Led, Performance-Driven <br />
          <span className="text-brand-primary">Clinical Life Sciences</span>
        </h1>
        <p className="text-brand-text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Clean decoupled frontend architecture for Web & Admin modules with unified design system tokens, HUD glassmorphism, and telemetry metrics.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button variant="primary" size="lg">
            Explore Web Pipeline
          </Button>
          <Button variant="glass" size="lg">
            Documentation
          </Button>
        </div>
      </section>

      {/* Architecture Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
        <Card variant="interactive" className="p-6">
          <Badge variant="primary" size="sm" className="mb-3">
            Web Application
          </Badge>
          <h2 className="font-heading font-semibold text-lg text-brand-navy mb-2">
            apps/web
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Public-facing portal with clinical trials, pipeline molecules, scientific research, and HCP discovery.
          </p>
        </Card>

        <Card variant="interactive" className="p-6">
          <Badge variant="secondary" size="sm" className="mb-3">
            Admin Console
          </Badge>
          <h2 className="font-heading font-semibold text-lg text-brand-navy mb-2">
            apps/admin
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Secure administrative console for cold-chain telemetry monitoring, batch inventory, and audit logs.
          </p>
        </Card>

        <Card variant="interactive" className="p-6">
          <Badge variant="vitality" size="sm" className="mb-3">
            Shared Design System
          </Badge>
          <h2 className="font-heading font-semibold text-lg text-brand-navy mb-2">
            packages/ui & config
          </h2>
          <p className="text-sm text-brand-text-muted leading-relaxed">
            Cross-app design tokens, typography scales, glassmorphism utilities, and reusable component primitives.
          </p>
        </Card>
      </section>

      {/* Footer Strip */}
      <footer className="mt-16 text-center text-xs text-brand-text-muted font-mono">
        MIRAGE DIRECTION TWO • FRONTEND SKELETON
      </footer>
    </main>
  );
}
