'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  StatusPip,
  TelemetryCard,
  StatusBadge,
  DataTable,
  ClinicalModal,
  type DataTableColumn,
} from '@mirage/ui';
import {
  Pill,
  ShieldCheck,
  FileText,
  Settings,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Globe2,
} from 'lucide-react';
import {
  MOCK_PRODUCTS,
  MOCK_COLD_CHAIN_DEPOTS,
  MOCK_GXP_AUDIT_LOGS,
  type Product,
} from '@mirage/types';

export default function AdminDashboardPage() {
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [modalMode, setModalMode] = useState<'dialog' | 'sheet'>('dialog');

  const productColumns: DataTableColumn<Product>[] = [
    {
      key: 'name',
      header: 'Formulation SKU',
      sortable: true,
      csvValue: (row) => `${row.name} (${row.brandLine})`,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <img
              src={row.heroImage}
              alt={row.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-xs text-brand-navy block">
              {row.name}
            </span>
            <span className="text-[11px] font-mono text-brand-primary">
              {row.subtitle}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Therapeutic Area',
      sortable: true,
      render: (row) => (
        <StatusBadge variant="bioglass" size="xs" code="CAT">
          {row.category}
        </StatusBadge>
      ),
    },
    {
      key: 'arabicSubtitle',
      header: 'Arabic Regulatory Label',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-slate-600 font-semibold">
          {row.arabicSubtitle}
        </span>
      ),
    },
    {
      key: 'packSizes',
      header: 'Certified Pack Sizes',
      csvValue: (row) =>
        row.packSizes.map((p) => `${p.quantity} ${p.unit}`).join(' | '),
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.packSizes.map((p, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-brand-navy font-mono text-[10px] font-bold"
            >
              {p.quantity} {p.unit}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Clinical Rating',
      sortable: true,
      align: 'center',
      csvValue: (row) => `${row.rating}/5.0 (${row.reviewsCount} reviews)`,
      render: (row) => (
        <span className="font-mono font-bold text-xs text-brand-navy tabular-numbers">
          ★ {row.rating.toFixed(1)}{' '}
          <span className="text-slate-400">({row.reviewsCount})</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'GxP Release Status',
      csvValue: () => 'EDA Released In-Spec',
      render: () => (
        <StatusBadge variant="in-spec" size="xs" pulse code="EDA">
          Released In-Spec
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      align: 'right',
      csvValue: (row) => row.slug,
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setModalMode('dialog');
            setInspectedProduct(row);
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-primary hover:text-white text-brand-navy font-mono text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>Dossier</span>
        </button>
      ),
    },
  ];

  const cmsModules = [
    {
      title: 'Formulation Studio (Products CMS)',
      desc: 'Add, edit, and manage public formulations, packaging sizes, prices, and stock.',
      href: '/products',
      metric: `${MOCK_PRODUCTS.length} Published SKUs`,
      icon: Pill,
      badgeVariant: 'bioglass' as const,
      tag: 'Catalog',
    },
    {
      title: 'Homepage & Hero Copy CMS',
      desc: 'Live bilingual headlines, badges, supporting mission paragraphs, and call-to-actions.',
      href: '/settings?tab=cms',
      metric: 'Bilingual (EN / AR)',
      icon: Globe2,
      badgeVariant: 'in-spec' as const,
      tag: 'Website Copy',
    },
    {
      title: 'Company Story & About CMS',
      desc: 'Bilingual corporate journey, scientific pillars, and certified quality standard descriptions.',
      href: '/settings?tab=company',
      metric: 'Bilingual (EN / AR)',
      icon: FileText,
      badgeVariant: 'regulatory' as const,
      tag: 'Story Copy',
    },
    {
      title: 'Security & Access Control',
      desc: 'Operator clearance levels, 21 CFR Part 11 policy controls, and system diagnostics.',
      href: '/settings',
      metric: 'Active & Verified',
      icon: Settings,
      badgeVariant: 'caution' as const,
      tag: 'System',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Executive Banner */}
      <section className="hud-glass p-6 sm:p-8 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-white/80 shadow-hud-glass">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge variant="in-spec" size="sm" pulse code="CMS SYNC">
              Website Content Hub Active
            </StatusBadge>
            <StatusPip status="optimal" label="Catalog & Public Routes Synchronized" />
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-brand-navy tracking-tight">
            Mirage Pharma — Content Management &amp; Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted max-w-3xl">
            Streamlined administration console for managing commercial formulations, bilingual website copy, our company story, and platform configurations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings?tab=cms">Edit Homepage Copy</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/products">Open Formulation Studio →</Link>
          </Button>
        </div>
      </section>

      {/* Sparkline Telemetry KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <TelemetryCard
          label="Active Website Products"
          value={MOCK_PRODUCTS.length}
          subtitle="Published on /products & /ar/products"
          delta="Catalog Live"
          targetSpec="100% In Spec"
          status="optimal"
          sparkline={[3, 3, 4, 4, 5, 5, 5]}
          icon={<Pill className="w-4 h-4" />}
        />

        <TelemetryCard
          label="Bilingual Sync Status"
          value="EN & AR"
          subtitle="Real-Time Revalidation"
          delta="Live Sync"
          targetSpec="SSR / ISR Active"
          status="optimal"
          sparkline={[1, 1, 1, 1, 2, 2, 2]}
          icon={<Globe2 className="w-4 h-4" />}
        />

        <TelemetryCard
          label="Our Story CMS"
          value="Published"
          subtitle="Bilingual Mission & Quality"
          delta="Sync Live"
          targetSpec="SSR / ISR Active"
          status="optimal"
          sparkline={[5, 5, 6, 6, 6, 7, 7]}
          icon={<FileText className="w-4 h-4" />}
        />

        <TelemetryCard
          label="Security & Compliance"
          value="Active"
          subtitle="21 CFR Part 11 & EDA"
          delta="Audit Active"
          targetSpec="Signed Records"
          status="optimal"
          sparkline={[1.8, 2.1, 2.4, 2.6, 2.9, 3.1, 3.42]}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </section>

      {/* DataTable: Formulations & Website Catalog */}
      <DataTable
        title="Commercial Formulations & Website Catalog"
        subtitle="Manage product monographs, pack sizes, stock availability, and Arabic regulatory labels"
        data={MOCK_PRODUCTS}
        columns={productColumns}
        rowKey={(row) => row.id}
        searchableKeys={['name', 'category', 'subtitle', 'arabicSubtitle']}
        searchPlaceholder="Search SKU, therapeutic category, or Arabic title..."
        exportFileName="mirage-naturals4be-catalog.csv"
        onRowClick={(row) => {
          setModalMode('dialog');
          setInspectedProduct(row);
        }}
      />

      {/* Website Management Workstations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-brand-navy">
              Website Management &amp; Operations Workstations
            </h2>
            <p className="text-xs text-brand-text-muted">
              Select any workstation to update public website content, products, or system security
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            Press Ctrl+K for instant search
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cmsModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-brand-primary/50 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge
                      variant={mod.badgeVariant}
                      size="xs"
                      code={mod.tag}
                    >
                      Active
                    </StatusBadge>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-brand-navy group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-brand-navy group-hover:text-brand-primary transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-brand-primary">
                    {mod.metric}
                  </span>
                  <span className="text-slate-400 group-hover:text-brand-primary transition-colors flex items-center gap-0.5">
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Split Grid: Live Cold-Chain Telemetry & Recent 21 CFR Part 11 GxP Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl bg-white border border-brand-border-subtle p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-heading font-bold text-base text-brand-navy">
                Refrigerated Logistics & Cryo-Depots
              </h2>
              <p className="text-xs text-slate-500">
                Real-time telemetry across Egyptian distribution nodes
              </p>
            </div>
            <Link
              href="/cold-chain"
              className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Open Telemetry Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_COLD_CHAIN_DEPOTS.map((depot) => (
              <div
                key={depot.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand-navy text-white">
                      {depot.code}
                    </span>
                    <span className="font-heading font-bold text-xs text-brand-navy truncate">
                      {depot.location}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {depot.activeBatches} Active Batches • RH {depot.humidityPercent}% • {depot.powerSource}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-extrabold text-base block tabular-numbers ${
                      depot.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-brand-primary'
                    }`}
                  >
                    +{depot.currentTempCelsius.toFixed(1)}°C
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                      depot.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {depot.status === 'warning' ? (
                      <>
                        <AlertTriangle className="w-3 h-3" /> Pre-Warn
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> In-Spec
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-brand-border-subtle p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-heading font-bold text-base text-brand-navy">
                21 CFR Part 11 GxP Compliance Stream
              </h2>
              <p className="text-xs text-slate-500">
                Cryptographically signed administrative mutations
              </p>
            </div>
            <Link
              href="/gxp-logs"
              className="text-xs font-bold text-brand-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Full Audit Ledger</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_GXP_AUDIT_LOGS.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-brand-navy">
                    {log.action}
                  </span>
                  <StatusBadge variant="bioglass" size="xs">
                    {log.regulation}
                  </StatusBadge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">
                  {log.diffSummary}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>
                    {log.actorName} ({log.actorRole})
                  </span>
                  <span>SHA256: {log.sha256Hash.slice(0, 12)}…</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Phase 2 ClinicalModal / Sheet Inspector */}
      {inspectedProduct ? (
        <ClinicalModal
          open={Boolean(inspectedProduct)}
          onClose={() => setInspectedProduct(null)}
          mode={modalMode}
          gxpBadge={`EDA / MOH MONOGRAPH • ${inspectedProduct.brandLine.toUpperCase()}`}
          title={`${inspectedProduct.name} — ${inspectedProduct.subtitle}`}
          subtitle={`Category: ${inspectedProduct.category} • Arabic Label: ${inspectedProduct.arabicSubtitle}`}
          footer={
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setModalMode((m) => (m === 'dialog' ? 'sheet' : 'dialog'))
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-xs font-mono font-bold text-brand-navy transition-colors"
                >
                  Switch to {modalMode === 'dialog' ? 'Side Sheet' : 'Centered Dialog'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInspectedProduct(null)}
                >
                  Close
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <Link href={`/products?product=${inspectedProduct.slug}`}>
                    Edit in Formulation Studio →
                  </Link>
                </Button>
              </div>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={inspectedProduct.heroImage}
                  alt={inspectedProduct.name}
                  className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200"
                />
                <div>
                  <span className="font-heading font-bold text-sm text-brand-navy block">
                    {inspectedProduct.tagline}
                  </span>
                  <span className="text-slate-500 block mt-0.5">
                    {inspectedProduct.dosageInstructions}
                  </span>
                </div>
              </div>
              <StatusBadge variant="in-spec" size="sm" pulse code="GxP">
                Active Batch
              </StatusBadge>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {inspectedProduct.description}
            </p>

            {inspectedProduct.supplementFacts ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 font-mono font-bold text-[11px] text-brand-navy flex justify-between">
                  <span>SUPPLEMENT FACTS ({inspectedProduct.supplementFacts.servingSize})</span>
                  <span>SERVINGS: {inspectedProduct.supplementFacts.servingsPerContainer}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {inspectedProduct.supplementFacts.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 flex items-center justify-between"
                    >
                      <span className="font-semibold text-brand-navy">
                        {ing.name}
                      </span>
                      <span className="font-mono text-brand-primary font-bold">
                        {ing.amountPerServing}{' '}
                        <span className="text-slate-400">
                          ({ing.dailyValuePercentage ?? 'NRV †'})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </ClinicalModal>
      ) : null}
    </div>
  );
}
