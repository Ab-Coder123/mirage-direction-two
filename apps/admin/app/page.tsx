import {
  Card,
  Badge,
  Button,
  StatusPip,
} from '@mirage/ui';
import {
  Pill,
  Thermometer,
  Mail,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@mirage/types';

export default function AdminDashboardPage() {
  const subscribers = [
    { email: 'dr.khashab@urology-clinic.eg', date: '2026-04-12', role: 'Physician', status: 'Active' },
    { email: 'pharmacist.samir@el-ezaby.com', date: '2026-04-10', role: 'Pharmacist', status: 'Active' },
    { email: 'mona.salem@gmail.com', date: '2026-04-08', role: 'Patient', status: 'Active' },
    { email: 'reem.adel@pediatrics.org.eg', date: '2026-04-05', role: 'Pediatrician', status: 'Active' },
    { email: 'karim.gamal@fitness-cairo.com', date: '2026-04-01', role: 'Patient', status: 'Active' },
  ];

  const coldChainNodes = [
    { location: 'Cairo Central Cryo-Depot (Fifth Settlement)', temp: '+4.2°C', target: '+2°C to +8°C', status: 'optimal', batches: 48 },
    { location: 'Alexandria Coastal Distribution Center', temp: '+4.8°C', target: '+2°C to +8°C', status: 'optimal', batches: 26 },
    { location: 'Giza Medical Logistics Hub', temp: '+5.1°C', target: '+2°C to +8°C', status: 'optimal', batches: 34 },
    { location: 'Upper Egypt Regional Transit Carrier (Asyut)', temp: '+4.4°C', target: '+2°C to +8°C', status: 'optimal', batches: 18 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 p-6 md:p-10 telemetry-grid">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header HUD */}
        <header className="hud-glass p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/80 shadow-hud-glass">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-heading font-black text-2xl text-brand-navy">
                Mirage Pharma Admin Portal
              </span>
              <Badge variant="secondary" size="sm">
                Direction Two v2.4
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-brand-text-muted">
              Clinical Supply Chain, Formulation Catalog, and Newsletter Dispatch Hub
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusPip status="optimal" label="All 4 Cold-Chain Nodes In-Spec" />
            <Button variant="outline" size="sm" asChild>
              <a href="http://localhost:3000" target="_blank" rel="noreferrer">
                View Public Web Portal →
              </a>
            </Button>
            <Button variant="primary" size="sm">
              Sync GxP Logs
            </Button>
          </div>
        </header>

        {/* Telemetry KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Active Formulations</span>
              <Pill className="w-4 h-4 text-brand-primary" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-brand-navy tabular-numbers">
              {MOCK_PRODUCTS.length}
            </p>
            <p className="text-xs text-brand-green mt-1 font-medium flex items-center gap-1">
              <span>●</span> 100% GxP & MoH Compliant
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Cold-Chain Sensors</span>
              <Thermometer className="w-4 h-4 text-brand-cyan" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-brand-primary tabular-numbers">
              +4.6°C
            </p>
            <p className="text-xs text-brand-text-muted mt-1">
              Target Range: +2.0°C to +8.0°C
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Newsletter Subscribers</span>
              <Mail className="w-4 h-4 text-brand-navy" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-brand-navy tabular-numbers">
              1,248
            </p>
            <p className="text-xs text-brand-green mt-1 font-medium">
              +38 new subscriptions this week
            </p>
          </Card>

          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider">Clinical Evidences</span>
              <Database className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-brand-navy tabular-numbers">
              24
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Indexed PubMed / DOI citations
            </p>
          </Card>
        </section>

        {/* SECTION 1: Product Portfolio Manager */}
        <section className="rounded-3xl bg-white border border-brand-border-subtle p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-heading font-bold text-lg text-brand-navy">
                Formulation Catalog & Packaging Matrix
              </h2>
              <p className="text-xs text-brand-text-muted">
                Active certified commercial lines under Naturals 4be
              </p>
            </div>
            <Button variant="outline" size="sm">
              + Register New Batch
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Regulatory Label</th>
                  <th className="p-3">Available Pack Sizes</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_PRODUCTS.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <span className="font-heading font-bold text-brand-navy block">
                        {prod.name}
                      </span>
                      <span className="text-[11px] text-brand-primary">
                        {prod.subtitle}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">{prod.category}</td>
                    <td className="p-3 font-mono text-slate-500">{prod.arabicSubtitle}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {prod.packSizes.map((p, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold"
                          >
                            {p.quantity} {p.unit}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active In-Market
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <a
                        href={`http://localhost:3000/products/${prod.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Preview</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: Split Grid: Newsletter Subscribers & Cold Chain Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newsletter Subscribers Table */}
          <section className="rounded-3xl bg-white border border-brand-border-subtle p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-heading font-bold text-base text-brand-navy">
                Recent Newsletter Dispatches
              </h2>
              <span className="text-xs font-mono text-slate-400">Opt-in Subscribers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase">
                  <tr>
                    <th className="p-2.5">Email</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {subscribers.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-brand-navy">{sub.email}</td>
                      <td className="p-2.5 text-slate-600">{sub.role}</td>
                      <td className="p-2.5 font-mono text-slate-400">{sub.date}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cold Chain Sensor Depots */}
          <section className="rounded-3xl bg-white border border-brand-border-subtle p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-heading font-bold text-base text-brand-navy">
                Refrigerated Logistics Telemetry
              </h2>
              <span className="text-xs font-mono text-emerald-600 font-bold">IoT Live Stream</span>
            </div>

            <div className="space-y-3">
              {coldChainNodes.map((node, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="font-heading font-bold text-xs text-brand-navy block">
                      {node.location}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {node.batches} Active Batches • Target {node.target}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-base text-brand-primary block">
                      {node.temp}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      In-Spec
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
