import { Card, Badge, Button, StatusPip } from '@mirage/ui';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-10 telemetry-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="hud-glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-hud-glass">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading font-bold text-xl text-brand-navy">
                Mirage Admin Console
              </span>
              <Badge variant="secondary" size="sm">
                v2.0 Direction
              </Badge>
            </div>
            <p className="text-sm text-brand-text-muted">
              Clinical Supply Chain, GxP Audit Logs, and Cold-Chain Logistics Hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPip status="optimal" label="IoT Sensors Online" />
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:3000" target="_blank" rel="noreferrer">
                ← Web Portal
              </a>
            </Button>
            <Button variant="primary" size="sm">
              Generate Audit Report
            </Button>
          </div>
        </header>

        {/* Telemetry Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-muted">
              Active Batches
            </p>
            <p className="text-3xl font-heading font-bold text-brand-navy mt-1 tabular-numbers">
              142
            </p>
            <p className="text-xs text-brand-green mt-1 font-medium">
              +12 this week • In-Spec
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-muted">
              Avg. Storage Temp
            </p>
            <p className="text-3xl font-heading font-bold text-brand-primary mt-1 tabular-numbers">
              +4.2°C
            </p>
            <p className="text-xs text-brand-text-muted mt-1">
              Target: +2°C to +8°C
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-muted">
              Cold-Chain Compliance
            </p>
            <p className="text-3xl font-heading font-bold text-brand-green mt-1 tabular-numbers">
              99.8%
            </p>
            <p className="text-xs text-brand-green mt-1 font-medium">
              0 excursions logged
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-muted">
              HCP Verification Requests
            </p>
            <p className="text-3xl font-heading font-bold text-brand-navy mt-1 tabular-numbers">
              18
            </p>
            <p className="text-xs text-amber-600 mt-1 font-medium">
              4 pending review
            </p>
          </Card>
        </section>

        {/* Operational Modules Skeleton */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="glass" className="p-6">
            <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">
              Batch Distribution & Cold Chain
            </h2>
            <p className="text-sm text-brand-text-muted mb-4">
              Real-time temperature telemetry from GPS-tracked carrier units across EMEA & North America.
            </p>
            <div className="h-40 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 flex items-center justify-center text-xs font-mono text-slate-500">
              [Cold-Chain Telemetry Grid Skeleton]
            </div>
          </Card>

          <Card variant="glass" className="p-6">
            <h2 className="font-heading font-bold text-lg text-brand-navy mb-2">
              HCP Regulatory Verification
            </h2>
            <p className="text-sm text-brand-text-muted mb-4">
              Medical practitioner license validation and restricted therapeutic prescribing access.
            </p>
            <div className="h-40 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 flex items-center justify-center text-xs font-mono text-slate-500">
              [Credential Verification Table Skeleton]
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
