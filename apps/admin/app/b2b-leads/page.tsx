'use client';

import React, { useState, useMemo } from 'react';
import {
  Badge,
  Button,
  StatusBadge,
  DataTable,
  type DataTableColumn,
  ClinicalModal,
} from '@mirage/ui';
import {
  Globe2,
  FileCheck2,
  CheckCircle2,
  Download,
  DollarSign,
  FileText,
  ExternalLink,
  Plus,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';
import { MOCK_B2B_INQUIRIES, type B2BAllianceInquiry } from '@mirage/types';
import { memoryStore, type B2BLeadRecord } from '@mirage/db';

function mapDbLeadToInquiry(l: B2BLeadRecord): B2BAllianceInquiry {
  return {
    id: l.id,
    referenceCode: `B2B-LEAD-${l.id.slice(-4).toUpperCase()}`,
    companyName: l.company_name,
    country: 'Egypt / MENA',
    archetype: (l.partnership_archetype === 'Hospital Network' ? 'Hospital Tender' : 'Commercial Distribution') as any,
    contactName: l.contact_name,
    contactRole: 'Procurement / Medical Lead',
    contactEmail: l.email,
    targetProducts: ['SymPDCA', 'NovaMirage'],
    estimatedAnnualValueUSD: '$250,000',
    ndaStatus: 'Pending Signature',
    stage: 'Discovery',
    submittedDate: (l.created_at ? l.created_at.split('T')[0] : null) ?? '2026-04-20',
    dossiersDownloaded: 0,
  };
}

const ARCHETYPES = [
  'All',
  'Commercial Distribution',
  'Contract Manufacturing (CMO)',
  'Hospital Tender',
  'In-Licensing',
] as const;

export default function B2BAlliancesHubPage() {
  const [leads, setLeads] = useState<B2BAllianceInquiry[]>(() => {
    const dbLeads = memoryStore.getLeads().map(mapDbLeadToInquiry);
    // Combine without duplicate IDs
    const combined = [...dbLeads];
    for (const mock of MOCK_B2B_INQUIRIES) {
      if (!combined.some((c) => c.id === mock.id)) {
        combined.push(mock);
      }
    }
    return combined;
  });
  const [selectedArchetype, setSelectedArchetype] = useState<string>('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    MOCK_B2B_INQUIRIES[0]?.id ?? 'b2b-001'
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // New Lead Form State
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCountry, setNewCountry] = useState('Saudi Arabia (KSA)');
  const [newArchetype, setNewArchetype] = useState<B2BAllianceInquiry['archetype']>('Commercial Distribution');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newValueUSD, setNewValueUSD] = useState('$500,000');

  const filteredLeads = useMemo(() => {
    return leads.filter(
      (l) => selectedArchetype === 'All' || l.archetype === selectedArchetype
    );
  }, [leads, selectedArchetype]);

  const activeLead = useMemo(() => {
    return (
      leads.find((l) => l.id === selectedLeadId) ??
      filteredLeads[0] ??
      leads[0]
    );
  }, [leads, selectedLeadId, filteredLeads]);

  // Statistics
  const stats = useMemo(() => {
    const totalDownloads = leads.reduce((acc, l) => acc + l.dossiersDownloaded, 0);
    const contractsSigned = leads.filter((l) => l.stage === 'Contract Executed').length;
    const ndaSigned = leads.filter((l) => l.ndaStatus === 'Signed').length;
    return { totalDownloads, contractsSigned, ndaSigned };
  }, [leads]);

  const advanceStage = (id: string) => {
    const order: B2BAllianceInquiry['stage'][] = [
      'Discovery',
      'Dossier Shared',
      'Term Sheet Negotiation',
      'Contract Executed',
    ];
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) return lead;
        const currIdx = order.indexOf(lead.stage);
        const nextStage = order[Math.min(currIdx + 1, order.length - 1)] ?? lead.stage;
        return { ...lead, stage: nextStage, ndaStatus: 'Signed' };
      })
    );
    setToastMsg(
      `Advanced alliance ${activeLead?.referenceCode} to "${order[Math.min(order.indexOf(activeLead?.stage ?? 'Discovery') + 1, order.length - 1)]}". Dossier telemetry logged.`
    );
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;

    const newLead: B2BAllianceInquiry = {
      id: `b2b-${Date.now()}`,
      referenceCode: `ALN-2026-INT-${leads.length + 1}`,
      companyName: newCompanyName.trim(),
      country: newCountry,
      archetype: newArchetype,
      contactName: newContactName || 'Authorized Signatory',
      contactRole: 'Procurement Director',
      contactEmail: newContactEmail || 'partnerships@company.com',
      targetProducts: ['Naturals 4be Portfolio'],
      estimatedAnnualValueUSD: newValueUSD || '$500,000',
      ndaStatus: 'Pending Signature',
      stage: 'Discovery',
      submittedDate: '2026-10-20',
      dossiersDownloaded: 0,
    };

    setLeads([newLead, ...leads]);
    setSelectedLeadId(newLead.id);
    setIsNewLeadModalOpen(false);
    setNewCompanyName('');
    setToastMsg(`Registered new partner inquiry for ${newLead.companyName}.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID,Reference Code,Company Name,Country,Archetype,Contact Name,Contact Role,Contact Email,Estimated Annual Value,NDA Status,Stage,Submitted Date,Dossiers Downloaded',
    ];
    const rows = leads.map(
      (l) =>
        `"${l.id}","${l.referenceCode}","${l.companyName}","${l.country}","${l.archetype}","${l.contactName}","${l.contactRole}","${l.contactEmail}","${l.estimatedAnnualValueUSD}","${l.ndaStatus}","${l.stage}","${l.submittedDate}","${l.dossiersDownloaded}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirage-b2b-strategic-alliances-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const columns: DataTableColumn<B2BAllianceInquiry>[] = [
    {
      key: 'companyName',
      header: 'Partner & Reference',
      sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-heading font-bold text-brand-navy text-xs">
            {row.companyName}
          </div>
          <div className="font-mono text-[10px] text-brand-primary font-bold">
            {row.referenceCode} • {row.country}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.companyName} (${row.referenceCode})`,
    },
    {
      key: 'archetype',
      header: 'Alliance Model',
      sortable: true,
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
          {row.archetype}
        </span>
      ),
      csvValue: (row) => row.archetype,
    },
    {
      key: 'estimatedAnnualValueUSD',
      header: 'Est. Annual Value',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-black text-emerald-600 text-xs">
          {row.estimatedAnnualValueUSD}
        </span>
      ),
      csvValue: (row) => row.estimatedAnnualValueUSD,
    },
    {
      key: 'ndaStatus',
      header: 'NDA Status',
      sortable: true,
      render: (row) => {
        const variant =
          row.ndaStatus === 'Signed'
            ? 'in-spec'
            : row.ndaStatus === 'Pending Signature'
            ? 'caution'
            : 'bioglass';
        return <StatusBadge variant={variant} size="sm">{row.ndaStatus}</StatusBadge>;
      },
      csvValue: (row) => row.ndaStatus,
    },
    {
      key: 'stage',
      header: 'Deal Stage',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-[11px] font-bold text-brand-navy">
          {row.stage}
        </span>
      ),
      csvValue: (row) => row.stage,
    },
    {
      key: 'actions',
      header: 'Dossier',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLeadId(row.id);
            setIsDossierModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-navy text-white hover:bg-brand-primary font-mono text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
        >
          <span>Dossier</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase 8 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Phase 8 • B2B Strategic Alliances Hub
            </Badge>
            <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              $7.32M Active MENA & European Pipeline
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Global Licensing, Tenders & Partner Dossier Hub
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Manage regional distribution agreements, hospital formulary tenders, NDA clearances, and confidential SmPC dossier telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsNewLeadModalOpen(true)}
            className="border-brand-primary/40 text-brand-navy hover:bg-brand-primary/10"
          >
            <Plus className="w-4 h-4 mr-1.5 text-brand-primary" />
            Register Partner Lead
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Pipeline CSV
          </Button>
        </div>
      </div>

      {toastMsg ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      ) : null}

      {/* High-Density Biomedical Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Pipeline Value
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 mt-1 tabular-numbers">
            $7.32M USD
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Active MENA & EU commercial tenders
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-primary font-bold">
            Qualified Partners
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {leads.length} Institutional Leads
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Distribution & CMO alliances
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-600 font-bold">
            Executed Contracts
          </div>
          <div className="text-2xl font-heading font-black text-brand-primary mt-1 tabular-numbers">
            {stats.contractsSigned} Executed
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            CHG Egypt hospital supply agreement
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Monograph Telemetry
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {stats.totalDownloads} Downloads
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Encrypted CTD dossiers accessed
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-2">
            Alliance Model:
          </span>
          {ARCHETYPES.map((arch) => (
            <button
              key={arch}
              type="button"
              onClick={() => setSelectedArchetype(arch)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedArchetype === arch
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {arch}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: DataTable + Alliance Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive DataTable */}
        <div className="lg:col-span-7">
          <DataTable<B2BAllianceInquiry>
            title="Strategic Institutional Leads"
            subtitle={`Showing ${filteredLeads.length} pharmaceutical alliances`}
            data={filteredLeads}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search company, reference code, country..."
            searchableKeys={['companyName', 'referenceCode', 'country', 'archetype', 'contactName']}
            defaultPageSize={6}
            exportFileName="mirage-b2b-alliances.csv"
            onRowClick={(row) => setSelectedLeadId(row.id)}
          />
        </div>

        {/* Right Column: Alliance Workstation */}
        <div className="lg:col-span-5">
          {activeLead ? (
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 sticky top-24">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary font-bold">
                      {activeLead.referenceCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({activeLead.submittedDate})
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-xl text-brand-navy">
                    {activeLead.companyName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {activeLead.country} • {activeLead.archetype}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-heading font-black text-lg text-emerald-600 font-mono">
                    {activeLead.estimatedAnnualValueUSD}
                  </span>
                  <StatusBadge
                    variant={
                      activeLead.ndaStatus === 'Signed'
                        ? 'in-spec'
                        : activeLead.ndaStatus === 'Pending Signature'
                        ? 'caution'
                        : 'bioglass'
                    }
                    size="sm"
                  >
                    NDA {activeLead.ndaStatus}
                  </StatusBadge>
                </div>
              </div>

              {/* Target Products */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                  Target Product Inquiries
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeLead.targetProducts.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4-Step Pipeline Stage Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Pipeline Progression
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-navy">
                    {activeLead.stage}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Discovery', 'Dossier Shared', 'Term Sheet Negotiation', 'Contract Executed'] as const).map(
                    (stg, idx) => {
                      const stages: B2BAllianceInquiry['stage'][] = [
                        'Discovery',
                        'Dossier Shared',
                        'Term Sheet Negotiation',
                        'Contract Executed',
                      ];
                      const currentIdx = stages.indexOf(activeLead.stage);
                      const isComplete = idx <= currentIdx;
                      return (
                        <div
                          key={stg}
                          className={`h-2 rounded-full transition-all ${
                            isComplete ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                          title={stg}
                        />
                      );
                    }
                  )}
                </div>
              </div>

              {/* Contact Representative */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Designated Corporate Contact
                </span>
                <div className="font-bold text-brand-navy">
                  {activeLead.contactName} ({activeLead.contactRole})
                </div>
                <div className="font-mono text-slate-500 text-[11px]">
                  {activeLead.contactEmail}
                </div>
              </div>

              {/* Monograph Download Telemetry */}
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-sky-700 font-bold flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-brand-primary" />
                    Encrypted Dossier Telemetry
                  </span>
                  <span className="font-mono text-brand-primary font-bold text-xs">
                    {activeLead.dossiersDownloaded} Monograph Downloads
                  </span>
                </div>
                <p className="text-sky-900 text-[11px] leading-relaxed">
                  Partner has reviewed the Common Technical Document (CTD) Module 3 & 4 clinical stability files.
                </p>
              </div>

              {/* Advance Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => advanceStage(activeLead.id)}
                  className="flex-1 bg-brand-navy hover:bg-brand-primary text-white"
                >
                  <ArrowRight className="w-4 h-4 mr-1.5" />
                  Advance Pipeline Stage
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDossierModalOpen(true)}
                  className="border-slate-300 text-slate-700"
                >
                  Full Sheet
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <Globe2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Select an institutional partner</p>
              <p className="text-xs text-slate-400">
                Click any row in the table to review licensing terms, track dossier downloads, and advance the pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Full Dossier Modal */}
      <ClinicalModal
        open={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={activeLead ? `B2B Strategic Dossier: ${activeLead.companyName}` : 'Alliance Dossier'}
        subtitle={activeLead ? `${activeLead.referenceCode} • ${activeLead.country}` : ''}
        mode="sheet"
        gxpBadge="B2B CONFIDENTIAL LICENSING"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              Est. Value: {activeLead?.estimatedAnnualValueUSD}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDossierModalOpen(false)}
            >
              Close Dossier
            </Button>
          </div>
        }
      >
        {activeLead ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-brand-navy text-white space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#61C0E4]">
                Enterprise Partner Profile
              </div>
              <div className="font-heading font-black text-xl">{activeLead.companyName}</div>
              <div className="font-mono text-slate-300">
                {activeLead.country} • {activeLead.archetype}
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                Annual Est. Revenue: {activeLead.estimatedAnnualValueUSD}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                Targeted Naturals 4be Formulations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeLead.targetProducts.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-lg bg-brand-primary text-white text-xs font-semibold"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                NDA & Legal Confidentiality Key
              </span>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-brand-navy font-semibold text-xs">
                  NDA Status: {activeLead.ndaStatus}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToken(`mrg_b2b_${activeLead.id}_${activeLead.referenceCode.replace(/[^a-zA-Z0-9]/g, '')}_ctd`)
                  }
                  className="text-xs font-mono text-brand-primary hover:underline flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedToken ? 'Copied Token' : 'Copy CTD Token'}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-xs text-[#61C0E4] break-all select-all mt-2">
                mrg_b2b_{activeLead.id}_{activeLead.referenceCode.replace(/[^a-zA-Z0-9]/g, '')}_ctd
              </div>
            </div>
          </div>
        ) : null}
      </ClinicalModal>

      {/* New Partner Lead Registration Modal */}
      <ClinicalModal
        open={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        title="Register New Institutional Alliance / Tender Lead"
        subtitle="Commercial Distribution, Hospital Formulary, CMO or In-Licensing"
        mode="dialog"
        maxWidthClass="max-w-xl"
        gxpBadge="NEW B2B ALLIANCE INTAKE"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewLeadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNewLead}
            >
              Create Alliance Lead
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateNewLead} className="space-y-4 text-xs">
          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Company / Institution Name *
            </label>
            <input
              type="text"
              required
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="e.g. Gulf Pharma Group KSA"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Territory / Country *
              </label>
              <input
                type="text"
                required
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="e.g. Kuwait / UAE"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Alliance Archetype
              </label>
              <select
                value={newArchetype}
                onChange={(e) =>
                  setNewArchetype(e.target.value as B2BAllianceInquiry['archetype'])
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
              >
                <option value="Commercial Distribution">Commercial Distribution</option>
                <option value="Contract Manufacturing (CMO)">Contract Manufacturing (CMO)</option>
                <option value="Hospital Tender">Hospital Tender</option>
                <option value="In-Licensing">In-Licensing</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Representative Contact
              </label>
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Dr. Tariq Al-Sayed"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Contact Corporate Email
              </label>
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="tariq@gulfpharma.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Est. Annual Value (USD)
            </label>
            <input
              type="text"
              value={newValueUSD}
              onChange={(e) => setNewValueUSD(e.target.value)}
              placeholder="$1,200,000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
            />
          </div>
        </form>
      </ClinicalModal>
    </div>
  );
}
