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
  CheckCircle2,
  FileText,
  Stethoscope,
  Send,
  Printer,
  Download,
  ExternalLink,
  ShieldAlert,
  User,
} from 'lucide-react';
import { MOCK_ADVERSE_EVENTS, type AdverseEventReport } from '@mirage/types';

const SERIOUSNESS_FILTERS = [
  'All',
  'Critical - Expedited 15-Day',
  'Serious - Hospitalization',
  'Non-Serious',
] as const;

const STATUS_FILTERS = [
  'All',
  'Open Triage',
  'Under Medical Review',
  'CIOMS Submitted',
  'Closed',
] as const;

const MEDDRA_DICTIONARY = [
  { code: '10028813', term: 'Mild Transient Nausea' },
  { code: '10033557', term: 'Sinus Tachycardia / Palpitations' },
  { code: '10046735', term: 'Urticaria / Mild Skin Rash' },
  { code: '10019211', term: 'Dyspepsia / Acid Reflux' },
  { code: '10016288', term: 'Flushing / Vasodilation' },
  { code: '10002034', term: 'Anaphylaxis / Severe Hypersensitivity' },
  { code: '10000000', term: 'No Adverse Effect — Product Quality Inquiry' },
];

export default function PharmacovigilancePage() {
  const [cases, setCases] = useState<AdverseEventReport[]>(MOCK_ADVERSE_EVENTS);
  const [seriousnessFilter, setSeriousnessFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    MOCK_ADVERSE_EVENTS[0]?.id ?? 'pv-001'
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modal states
  const [isCiomsModalOpen, setIsCiomsModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSerious =
        seriousnessFilter === 'All' || c.seriousness === seriousnessFilter;
      const matchStatus =
        statusFilter === 'All' || c.status === statusFilter;
      return matchSerious && matchStatus;
    });
  }, [cases, seriousnessFilter, statusFilter]);

  const activeCase = useMemo(() => {
    return (
      cases.find((c) => c.id === selectedCaseId) ??
      filteredCases[0] ??
      cases[0]
    );
  }, [cases, selectedCaseId, filteredCases]);

  // Statistics for Telemetry Cards
  const stats = useMemo(() => {
    const critical = cases.filter(
      (c) => c.seriousness === 'Critical - Expedited 15-Day'
    ).length;
    const serious = cases.filter(
      (c) => c.seriousness === 'Serious - Hospitalization'
    ).length;
    const nonSerious = cases.filter((c) => c.seriousness === 'Non-Serious').length;
    const ciomsSent = cases.filter((c) => c.status === 'CIOMS Submitted').length;
    return { critical, serious, nonSerious, ciomsSent };
  }, [cases]);

  const updateCaseStatus = (
    id: string,
    nextStatus: AdverseEventReport['status'],
    nextCausality?: AdverseEventReport['causalityAssessment'],
    nextMeddra?: string
  ) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: nextStatus,
              causalityAssessment: nextCausality ?? c.causalityAssessment,
              meddraPreferredTerm: nextMeddra ?? c.meddraPreferredTerm,
            }
          : c
      )
    );
    setActionFeedback(
      `Case ${activeCase?.caseNumber} transitioned to "${nextStatus}". Signed into 21 CFR Part 11 PV ledger.`
    );
    setTimeout(() => setActionFeedback(null), 4000);

    if (nextStatus === 'CIOMS Submitted') {
      setIsCiomsModalOpen(true);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Case Number,Reported Date,Product,Batch,Patient,Age,Sex,MedDRA PT,Seriousness,Causality,Reporter Type,Reporter Contact,Status,Reaction Summary',
    ];
    const rows = cases.map(
      (c) =>
        `"${c.caseNumber}","${c.reportedAt}","${c.productName}","${c.batchNumber}","${c.patientInitials}","${c.patientAge}","${c.patientSex}","${c.meddraPreferredTerm}","${c.seriousness}","${c.causalityAssessment}","${c.reporterType}","${c.reporterContact}","${c.status}","${c.reactionSummary.replace(/"/g, '""')}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirage-pharmacovigilance-registry-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<AdverseEventReport>[] = [
    {
      key: 'caseNumber',
      header: 'Case ID & Date',
      sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-brand-navy text-xs">
            {row.caseNumber}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.reportedAt}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.caseNumber} (${row.reportedAt})`,
    },
    {
      key: 'productName',
      header: 'Suspect Product',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-heading font-bold text-brand-navy text-xs">
            {row.productName}
          </div>
          <div className="text-[10px] font-mono text-brand-primary">
            {row.batchNumber}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.productName} - ${row.batchNumber}`,
    },
    {
      key: 'patientInitials',
      header: 'Patient Demographic',
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs text-brand-navy">
          <span className="font-bold">{row.patientInitials}</span> •{' '}
          <span>{row.patientAge}y</span> •{' '}
          <span className="text-slate-500 font-semibold">{row.patientSex}</span>
        </div>
      ),
      csvValue: (row) => `${row.patientInitials}, ${row.patientAge}y, ${row.patientSex}`,
    },
    {
      key: 'meddraPreferredTerm',
      header: 'MedDRA PT Reaction',
      sortable: true,
      render: (row) => (
        <div className="max-w-[200px]">
          <span className="text-xs text-brand-navy font-medium block truncate" title={row.meddraPreferredTerm}>
            {row.meddraPreferredTerm}
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {row.reactionSummary}
          </span>
        </div>
      ),
      csvValue: (row) => row.meddraPreferredTerm,
    },
    {
      key: 'seriousness',
      header: 'Seriousness',
      sortable: true,
      render: (row) => {
        const variant =
          row.seriousness === 'Critical - Expedited 15-Day'
            ? 'excursion'
            : row.seriousness === 'Serious - Hospitalization'
            ? 'caution'
            : 'in-spec';
        return (
          <StatusBadge
            variant={variant}
            size="sm"
            pulse={row.seriousness === 'Critical - Expedited 15-Day'}
          >
            {row.seriousness === 'Critical - Expedited 15-Day'
              ? 'Critical 15-Day'
              : row.seriousness === 'Serious - Hospitalization'
              ? 'Serious Inpatient'
              : 'Non-Serious'}
          </StatusBadge>
        );
      },
      csvValue: (row) => row.seriousness,
    },
    {
      key: 'actions',
      header: 'Triage',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCaseId(row.id);
            setIsDossierModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-navy text-white hover:bg-brand-primary font-mono text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
        >
          <span>Triage</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase 7 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Pharmacovigilance 24/7 Triage
            </Badge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Operational Demo
            </span>
            <span className="text-xs font-mono text-rose-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              WHO CIOMS-I & MedDRA v27.0 Engine Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Adverse Drug Reaction (ADR) & Safety Triage Hub
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Evaluate post-marketing safety reports, assign MedDRA Preferred Terms, calculate seriousness criteria, and dispatch expedited 15-day CIOMS-I dossiers to the Egyptian Drug Authority (EDA).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCiomsModalOpen(true)}
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
          >
            <FileText className="w-4 h-4 mr-1.5 text-rose-600" />
            Official CIOMS-I Form
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Safety Registry
          </Button>
        </div>
      </div>

      {actionFeedback ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      ) : null}

      {/* High-Density Biomedical Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-600 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Expedited 15-Day
          </div>
          <div className="text-2xl font-heading font-black text-rose-600 mt-1 tabular-numbers">
            {stats.critical} Critical Case
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Mandatory EDA submission window
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-bold">
            Serious / Inpatient
          </div>
          <div className="text-2xl font-heading font-black text-amber-600 mt-1 tabular-numbers">
            {stats.serious} Cases
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Hospitalization / clinical review
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold">
            Non-Serious Monitored
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {stats.nonSerious} Cases
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Routine safety surveillance
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-600 font-bold">
            CIOMS Transmissions
          </div>
          <div className="text-2xl font-heading font-black text-brand-primary mt-1 tabular-numbers">
            {stats.ciomsSent} Transmitted
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            E2B(R3) XML / PDF Dossiers
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Filter By Seriousness Criteria
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {SERIOUSNESS_FILTERS.map((sf) => (
                <button
                  key={sf}
                  type="button"
                  onClick={() => setSeriousnessFilter(sf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    seriousnessFilter === sf
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {sf}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Filter By Triage Status
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-brand-primary text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: DataTable + Interactive Triage Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive DataTable */}
        <div className="lg:col-span-7">
          <DataTable<AdverseEventReport>
            title="Adverse Reaction Safety Tickets"
            subtitle={`Showing ${filteredCases.length} pharmacovigilance reports`}
            data={filteredCases}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search case, product, MedDRA PT, or reporter..."
            searchableKeys={['caseNumber', 'productName', 'meddraPreferredTerm', 'patientInitials', 'batchNumber']}
            defaultPageSize={6}
            exportFileName="mirage-adverse-events.csv"
            onRowClick={(row) => setSelectedCaseId(row.id)}
          />
        </div>

        {/* Right Column: Triage Workstation */}
        <div className="lg:col-span-5">
          {activeCase ? (
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 sticky top-24">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-600 font-bold">
                      Safety Dossier • {activeCase.caseNumber}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({activeCase.reportedAt})
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-xl text-brand-navy">
                    {activeCase.productName}
                  </h2>
                  <p className="text-xs font-mono text-brand-primary font-bold">
                    Batch: {activeCase.batchNumber}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                    {activeCase.status}
                  </span>
                  <StatusBadge
                    variant={
                      activeCase.seriousness === 'Critical - Expedited 15-Day'
                        ? 'excursion'
                        : activeCase.seriousness === 'Serious - Hospitalization'
                        ? 'caution'
                        : 'in-spec'
                    }
                    size="sm"
                  >
                    {activeCase.seriousness}
                  </StatusBadge>
                </div>
              </div>

              {/* Patient & Reporter Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center gap-1">
                    <User className="w-3 h-3 text-brand-primary" /> Patient Subject
                  </span>
                  <div className="font-bold text-brand-navy font-mono">
                    {activeCase.patientInitials} • {activeCase.patientAge} Years • Sex: {activeCase.patientSex}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Stethoscope className="w-3 h-3 text-brand-primary" /> Reporter Source
                  </span>
                  <div className="font-bold text-brand-navy">
                    {activeCase.reporterType}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate" title={activeCase.reporterContact}>
                    {activeCase.reporterContact}
                  </div>
                </div>
              </div>

              {/* Reaction Summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Clinical Event Narrative
                </span>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 leading-relaxed font-sans">
                  {activeCase.reactionSummary}
                </div>
              </div>

              {/* MedDRA Coding Assistant */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    MedDRA v27.0 Preferred Term (PT) Assignment
                  </span>
                  <span className="text-[10px] font-mono text-brand-primary font-bold">
                    WHO-ART Aligned
                  </span>
                </div>
                <select
                  value={activeCase.meddraPreferredTerm}
                  onChange={(e) =>
                    updateCaseStatus(
                      activeCase.id,
                      activeCase.status,
                      activeCase.causalityAssessment,
                      e.target.value
                    )
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-brand-navy focus:outline-none focus:border-brand-primary"
                >
                  {MEDDRA_DICTIONARY.map((dict) => {
                    const label = `${dict.term} (${dict.code})`;
                    return (
                      <option key={dict.code} value={label}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Causality Assessment */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  WHO-UMC Causality Assessment
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {(['Certain', 'Probable', 'Possible', 'Unlikely'] as const).map(
                    (causality) => (
                      <button
                        key={causality}
                        type="button"
                        onClick={() =>
                          updateCaseStatus(activeCase.id, activeCase.status, causality)
                        }
                        className={`p-2 rounded-xl text-center font-mono text-[11px] font-bold border transition-all ${
                          activeCase.causalityAssessment === causality
                            ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {causality}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* One-Click Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Triage Decision & EDA Dispatch (21 CFR Part 11)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      updateCaseStatus(
                        activeCase.id,
                        'CIOMS Submitted',
                        activeCase.causalityAssessment
                      )
                    }
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Dispatch Expedited CIOMS-I
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateCaseStatus(
                        activeCase.id,
                        'Under Medical Review',
                        activeCase.causalityAssessment
                      )
                    }
                    className="border-slate-300 text-slate-700"
                  >
                    <Stethoscope className="w-4 h-4 mr-1.5 text-slate-500" />
                    Medical Review
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateCaseStatus(
                        activeCase.id,
                        'Closed',
                        activeCase.causalityAssessment
                      )
                    }
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    Close Ticket
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Select an adverse event case</p>
              <p className="text-xs text-slate-400">
                Click any row in the safety table to assign MedDRA terms, evaluate causality, or dispatch an expedited CIOMS-I dossier.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Full Dossier Modal */}
      <ClinicalModal
        open={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={activeCase ? `Safety Incident Dossier: ${activeCase.caseNumber}` : 'Safety Dossier'}
        subtitle={activeCase ? `Product: ${activeCase.productName} • Batch ${activeCase.batchNumber}` : ''}
        mode="sheet"
        gxpBadge="WHO CIOMS-I ADVERSE REACTION"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              EDA Expedited Reporting Form
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
        {activeCase ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-brand-navy text-white space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#61C0E4]">
                Suspect Formulation Record
              </div>
              <div className="font-heading font-black text-xl">{activeCase.productName}</div>
              <div className="font-mono text-slate-300">
                Batch Number: {activeCase.batchNumber}
              </div>
              <div className="font-mono text-rose-300 font-bold">
                Seriousness: {activeCase.seriousness}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                Assigned MedDRA Preferred Term
              </span>
              <div className="font-bold text-brand-navy text-sm font-mono">
                {activeCase.meddraPreferredTerm}
              </div>
              <p className="text-slate-600 leading-relaxed font-sans">
                {activeCase.reactionSummary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                Causality & Reporter
              </span>
              <div className="text-brand-navy font-mono font-semibold">
                WHO-UMC Causality: {activeCase.causalityAssessment}
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Reported by {activeCase.reporterType} ({activeCase.reporterContact})
              </div>
            </div>
          </div>
        ) : null}
      </ClinicalModal>

      {/* Official WHO CIOMS-I Form Preview Modal */}
      <ClinicalModal
        open={isCiomsModalOpen}
        onClose={() => setIsCiomsModalOpen(false)}
        title="WHO CIOMS-I Standard Adverse Reaction Reporting Form"
        subtitle="Expedited 15-Day Safety Report for Egyptian Drug Authority (EDA) & WHO-UMC"
        mode="dialog"
        maxWidthClass="max-w-4xl"
        gxpBadge="OFFICIAL CIOMS-I FORM"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              CIOMS Form Ref: CIOMS-MRG-2026-0911
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print / Save PDF
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCiomsModalOpen(false)}
              >
                Close Form
              </Button>
            </div>
          </div>
        }
      >
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6 text-brand-navy text-xs">
          {/* CIOMS Header */}
          <div className="text-center border-b pb-4 border-slate-200 space-y-1">
            <div className="font-heading font-black text-lg tracking-tight text-brand-navy">
              SUSPECT ADVERSE REACTION REPORT (CIOMS-I FORM)
            </div>
            <div className="text-slate-500 font-mono text-[11px]">
              Council for International Organizations of Medical Sciences • Geneva, Switzerland
            </div>
            <div className="text-rose-600 font-mono font-bold text-[11px]">
              ★ EXPEDITED 15-DAY REGULATORY SUBMISSION MANDATORY
            </div>
          </div>

          {/* Section I: Reaction Information */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold font-mono uppercase text-[10px] text-slate-700 border-b border-slate-300">
              I. REACTION INFORMATION
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">1. Patient Initials</span>
                <span className="font-bold font-mono">{activeCase?.patientInitials ?? 'M.S.'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">2. Age / Sex</span>
                <span className="font-bold font-mono">
                  {activeCase?.patientAge ?? 29} Years / {activeCase?.patientSex ?? 'F'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] block">3. Date of Reaction</span>
                <span className="font-bold font-mono">{activeCase?.reportedAt ?? '2026-10-19'}</span>
              </div>
              <div className="sm:col-span-3 pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-mono text-[10px] block">4. Describe Reaction(s) (MedDRA PT)</span>
                <p className="font-semibold text-brand-navy mt-0.5">
                  {activeCase?.meddraPreferredTerm}: {activeCase?.reactionSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Section II: Suspect Drug(s) */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold font-mono uppercase text-[10px] text-slate-700 border-b border-slate-300">
              II. SUSPECT DRUG(S) INFORMATION
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">14. Suspect Drug Trade Name</span>
                <span className="font-bold text-brand-navy">{activeCase?.productName ?? 'Inositol'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">15. Batch / Lot Number</span>
                <span className="font-bold text-brand-primary">{activeCase?.batchNumber ?? 'BATCH-IN-2026-084'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">16. Route & Daily Dose</span>
                <span className="font-bold text-brand-navy">Oral • As directed on SmPC</span>
              </div>
            </div>
          </div>

          {/* Section IV: Manufacturer / Qualified Person Sign-Off */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold font-mono uppercase text-[10px] text-slate-700 border-b border-slate-300">
              IV. MANUFACTURER / SPONSOR INFORMATION & QPPV SIGN-OFF
            </div>
            <div className="p-3 grid grid-cols-2 gap-4 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">Mfr / Sponsor Name & Address</span>
                <span className="font-bold text-brand-navy block">Mirage Pharmaceuticals S.A.E.</span>
                <span className="text-slate-500 text-[10px]">Industrial Zone, 6th of October City, Giza, Egypt</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Qualified Person for PV (QPPV)</span>
                <span className="font-bold text-emerald-700 block">Dr. Nadia Mansour (Medical Director)</span>
                <span className="text-[10px] text-emerald-600">Electronic Signature Verified • 21 CFR Part 11</span>
              </div>
            </div>
          </div>
        </div>
      </ClinicalModal>
    </div>
  );
}
