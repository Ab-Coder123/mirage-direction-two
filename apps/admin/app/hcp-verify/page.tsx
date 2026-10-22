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
  AlertOctagon,
  Building2,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  ExternalLink,
  RefreshCw,
  UserCheck,
  UserX,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { MOCK_HCP_APPLICATIONS, type HCPApplication } from '@mirage/types';

const STATUS_FILTERS = [
  'All',
  'Pending Review',
  'Verified',
  'Flagged',
  'More Info Requested',
] as const;

export default function HCPCredentialingPage() {
  const [applications, setApplications] = useState<HCPApplication[]>(
    MOCK_HCP_APPLICATIONS
  );
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedHcpId, setSelectedHcpId] = useState<string>(
    MOCK_HCP_APPLICATIONS[1]?.id ?? 'hcp-002'
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Modals state
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSyndicateSyncing, setIsSyndicateSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus =
        statusFilter === 'All' || app.status === statusFilter;
      return matchesStatus;
    });
  }, [applications, statusFilter]);

  const activeHcp = useMemo(() => {
    return (
      applications.find((a) => a.id === selectedHcpId) ??
      filteredApplications[0] ??
      applications[0]
    );
  }, [applications, selectedHcpId, filteredApplications]);

  // Counts for Telemetry Cards
  const stats = useMemo(() => {
    const pending = applications.filter((a) => a.status === 'Pending Review').length;
    const verified = applications.filter((a) => a.status === 'Verified').length;
    const flagged = applications.filter((a) => a.status === 'Flagged').length;
    const moreInfo = applications.filter((a) => a.status === 'More Info Requested').length;
    return { pending, verified, flagged, moreInfo };
  }, [applications]);

  const updateHcpStatus = (
    id: string,
    nextStatus: HCPApplication['status'],
    note?: string
  ) => {
    const finalNote = note || `Status updated to ${nextStatus} by Medical Director`;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id
          ? { ...app, status: nextStatus, verificationNotes: finalNote }
          : app
      )
    );
    setActionFeedback(
      `HCP Record ${id} (${nextStatus}): 21 CFR Part 11 Electronic Signature Logged.`
    );
    setTimeout(() => setActionFeedback(null), 4000);

    if (nextStatus === 'Verified') {
      setIsTokenModalOpen(true);
    }
  };

  const handleSyncSyndicateRegistry = () => {
    setIsSyndicateSyncing(true);
    setTimeout(() => {
      setIsSyndicateSyncing(false);
      setSyncNotice(
        'Syndicate Gateway Synchronized: 7 Practitioner Registrations cross-referenced with Egyptian Medical Syndicate (EMS) & Egyptian Pharmacists Syndicate (EPS) live database.'
      );
      setTimeout(() => setSyncNotice(null), 6000);
    }, 1000);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID,Full Name,Title,Specialty,Syndicate License,Institution,Governorate,Email,Phone,Submitted Date,Status,Notes',
    ];
    const rows = applications.map(
      (a) =>
        `"${a.id}","${a.fullName}","${a.title}","${a.specialty}","${a.syndicateLicenseNumber}","${a.institution}","${a.governorate}","${a.email}","${a.phone}","${a.submittedAt}","${a.status}","${a.verificationNotes.replace(/"/g, '""')}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirage-hcp-practitioners-registry-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const columns: DataTableColumn<HCPApplication>[] = [
    {
      key: 'fullName',
      header: 'Practitioner & Specialty',
      sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-heading font-bold text-brand-navy text-xs flex items-center gap-1.5">
            {row.fullName}
          </div>
          <div className="text-[11px] text-brand-primary font-medium">
            {row.title}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.specialty}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.fullName} - ${row.title} (${row.specialty})`,
    },
    {
      key: 'syndicateLicenseNumber',
      header: 'Syndicate License',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-brand-navy text-xs block">
            {row.syndicateLicenseNumber}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.governorate} Governorate
          </span>
        </div>
      ),
      csvValue: (row) => `${row.syndicateLicenseNumber} (${row.governorate})`,
    },
    {
      key: 'institution',
      header: 'Affiliated Institution',
      sortable: true,
      render: (row) => (
        <div className="max-w-[170px] truncate text-xs text-brand-navy" title={row.institution}>
          <div className="font-medium truncate">{row.institution}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.email}</div>
        </div>
      ),
      csvValue: (row) => row.institution,
    },
    {
      key: 'status',
      header: 'Credential Status',
      sortable: true,
      render: (row) => {
        const variant =
          row.status === 'Verified'
            ? 'in-spec'
            : row.status === 'Flagged'
            ? 'excursion'
            : row.status === 'More Info Requested'
            ? 'bioglass'
            : 'caution';
        return <StatusBadge variant={variant} size="sm">{row.status}</StatusBadge>;
      },
      csvValue: (row) => row.status,
    },
    {
      key: 'actions',
      header: 'Review',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedHcpId(row.id);
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
      {/* Phase 6 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              HCP Credentialing &amp; Verification
            </Badge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Operational Demo
            </span>
            <span className="text-xs font-mono text-brand-primary font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              EMS & EPS Syndicate Gateway Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Healthcare Professional Verification & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Verify Egyptian Medical Syndicate (EMS) and Egyptian Pharmacists Syndicate (EPS) credentials before granting tier-1 prescriber access to clinical dosage calculators and SmPC trial monographs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncSyndicateRegistry}
            disabled={isSyndicateSyncing}
            className="border-brand-primary/40 text-brand-navy hover:bg-brand-primary/10"
          >
            <RefreshCw
              className={`w-4 h-4 mr-1.5 text-brand-primary ${
                isSyndicateSyncing ? 'animate-spin' : ''
              }`}
            />
            {isSyndicateSyncing ? 'Syncing Gateway...' : 'Sync Syndicate Registry'}
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Credential Registry
          </Button>
        </div>
      </div>

      {syncNotice ? (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
          <span>{syncNotice}</span>
        </div>
      ) : null}

      {actionFeedback ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      ) : null}

      {/* High-Density Biomedical Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-bold">
            Pending Review
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {stats.pending} Applications
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Awaiting Medical Director sign-off
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold">
            Verified Prescribers
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 mt-1 tabular-numbers">
            {stats.verified} Licensed
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Active cryptographic tokens issued
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-rose-600 font-bold">
            Flagged Anomalies
          </div>
          <div className="text-2xl font-heading font-black text-rose-600 mt-1 tabular-numbers">
            {stats.flagged} Flagged
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Syndicate registration discrepancy
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-600 font-bold">
            Syndicate Gateway
          </div>
          <div className="text-2xl font-heading font-black text-brand-primary mt-1 tabular-numbers">
            99.8% Online
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            EMS Cairo / Alex API Connected
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-2">
            Filter Status:
          </span>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Layout: DataTable + Embedded Practitioner Dossier Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive DataTable */}
        <div className="lg:col-span-7">
          <DataTable<HCPApplication>
            title="Practitioner Credential Applications"
            subtitle={`Showing ${filteredApplications.length} healthcare professional records`}
            data={filteredApplications}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search physician, EMS license, or hospital..."
            searchableKeys={['fullName', 'syndicateLicenseNumber', 'institution', 'specialty']}
            defaultPageSize={6}
            exportFileName="mirage-hcp-applications.csv"
            onRowClick={(row) => setSelectedHcpId(row.id)}
          />
        </div>

        {/* Right Column: Practitioner Credential Dossier Inspector */}
        <div className="lg:col-span-5">
          {activeHcp ? (
            <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-6 sticky top-24">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary font-bold">
                      Practitioner Dossier • {activeHcp.id.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({activeHcp.submittedAt})
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-xl text-brand-navy">
                    {activeHcp.fullName}
                  </h2>
                  <p className="text-xs text-brand-primary font-medium">
                    {activeHcp.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {activeHcp.specialty}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-3 py-1 rounded-xl bg-brand-navy text-white font-mono text-xs font-bold">
                    {activeHcp.syndicateLicenseNumber}
                  </span>
                  <StatusBadge
                    variant={
                      activeHcp.status === 'Verified'
                        ? 'in-spec'
                        : activeHcp.status === 'Flagged'
                        ? 'excursion'
                        : activeHcp.status === 'More Info Requested'
                        ? 'bioglass'
                        : 'caution'
                    }
                    size="sm"
                  >
                    {activeHcp.status}
                  </StatusBadge>
                </div>
              </div>

              {/* Syndicate Verification Match Status */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
                    Syndicate Electronic Match
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">
                    EMS Registry Sync
                  </span>
                </div>
                <div className="font-mono text-[11px] text-brand-navy bg-white p-2.5 rounded-xl border border-slate-200">
                  {activeHcp.status === 'Flagged' ? (
                    <span className="text-rose-600 font-bold flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      MISMATCH: License ID not confirmed in Egyptian Medical Syndicate active ledger.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      MATCH CONFIRMED: Active Consultant Practitioner ID verified.
                    </span>
                  )}
                </div>
              </div>

              {/* Affiliation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-bold">
                    <Building2 className="w-3 h-3 text-brand-primary" /> Institution
                  </span>
                  <p className="font-bold text-brand-navy truncate" title={activeHcp.institution}>
                    {activeHcp.institution}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {activeHcp.governorate} Governorate
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1 font-bold">
                    <Mail className="w-3 h-3 text-brand-primary" /> Contact Channels
                  </span>
                  <p className="font-mono text-brand-navy truncate text-[11px]" title={activeHcp.email}>
                    {activeHcp.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> {activeHcp.phone}
                  </p>
                </div>
              </div>

              {/* Requested Portals */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                  Requested Clinical Portals & Resources
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHcp.requestedPortals.map((portal) => (
                    <span
                      key={portal}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-medium"
                    >
                      {portal}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification Notes */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Medical Review & Audit Trail Notes
                </span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono leading-relaxed">
                  {activeHcp.verificationNotes}
                </div>
              </div>

              {/* One-Click Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Credential Decision (Medical Director Clearance)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      updateHcpStatus(
                        activeHcp.id,
                        'Verified',
                        'EMS syndicate license verified against official registry. Tier-1 prescriber token issued.'
                      )
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="w-4 h-4 mr-1.5" />
                    Approve & Issue Key
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateHcpStatus(
                        activeHcp.id,
                        'More Info Requested',
                        'Requested scanned syndicate membership renewal stamp for current calendar year.'
                      )
                    }
                    className="border-slate-300 text-slate-700"
                  >
                    <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                    Request Proof
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateHcpStatus(
                        activeHcp.id,
                        'Flagged',
                        'Flagged for manual investigation due to credential mismatch with EMS database.'
                      )
                    }
                    className="border-rose-300 text-rose-700 hover:bg-rose-50"
                  >
                    <UserX className="w-4 h-4 mr-1.5 text-rose-600" />
                    Flag
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Select a practitioner</p>
              <p className="text-xs text-slate-400">
                Click any practitioner row to review their syndicate credentials and issue clinical access keys.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Full Dossier Modal */}
      <ClinicalModal
        open={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title={activeHcp ? `HCP Clinical Dossier: ${activeHcp.fullName}` : 'HCP Dossier'}
        subtitle={activeHcp ? `${activeHcp.title} • ${activeHcp.syndicateLicenseNumber}` : ''}
        mode="sheet"
        gxpBadge="21 CFR PART 11 VERIFIED"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
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
        {activeHcp ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-brand-navy text-white space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#61C0E4]">
                Egyptian Syndicate Verified Entity
              </div>
              <div className="font-heading font-black text-xl">{activeHcp.fullName}</div>
              <div className="font-mono text-slate-300">{activeHcp.institution}</div>
              <div className="font-mono text-emerald-400 font-bold">
                Syndicate License: {activeHcp.syndicateLicenseNumber}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px]">
                Authorized Monograph Entitlements
              </span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                {activeHcp.requestedPortals.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-brand-navy font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px]">
                Audit Trail Log
              </span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-600">
                {activeHcp.verificationNotes}
              </div>
            </div>
          </div>
        ) : null}
      </ClinicalModal>

      {/* Access Key Issued Modal */}
      <ClinicalModal
        open={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        title="Practitioner Clinical Access Key Issued"
        subtitle={activeHcp ? `Prescriber Access Token Generated for ${activeHcp.fullName}` : ''}
        mode="dialog"
        maxWidthClass="max-w-md"
        gxpBadge="TIER-1 PRESCRIBER ACCESS"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              Valid for 365 Days
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTokenModalOpen(false)}
            >
              Done & Return to Queue
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Practitioner Successfully Verified</div>
              <div className="text-emerald-700">
                Electronic signature recorded in 21 CFR Part 11 Audit Trail. The practitioner can now access clinical monographs.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px]">
                Cryptographic Bearer Access Token
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToken(
                    `mrg_hcp_2026_${activeHcp?.id ?? '001'}_${activeHcp?.syndicateLicenseNumber.replace(
                      /[^a-zA-Z0-9]/g,
                      ''
                    )}_sec9910`
                  )
                }
                className="text-[10px] font-mono text-brand-primary hover:underline flex items-center gap-1"
              >
                {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedToken ? 'Copied Token' : 'Copy Token'}
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-[#61C0E4] break-all select-all">
              mrg_hcp_2026_{activeHcp?.id ?? '001'}_{activeHcp?.syndicateLicenseNumber.replace(/[^a-zA-Z0-9]/g, '')}_sec9910
            </div>
          </div>
        </div>
      </ClinicalModal>
    </div>
  );
}
