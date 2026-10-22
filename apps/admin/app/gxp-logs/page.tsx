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
  KeyRound,
  Download,
  FileCode2,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  Hash,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { MOCK_GXP_AUDIT_LOGS, type GxPAuditLog } from '@mirage/types';

const REGULATIONS = [
  'All',
  'FDA 21 CFR Part 11',
  'EDA GxP',
  'EU GMP Annex 11',
  'WHO TRS 961',
] as const;

const MODULES = [
  'All',
  'Formulations',
  'Cold-Chain',
  'HCP Credentialing',
  'Pharmacovigilance',
  'B2B Licensing',
] as const;

export default function GxPAuditLedgerPage() {
  const [selectedReg, setSelectedReg] = useState<string>('All');
  const [selectedModule, setSelectedModule] = useState<string>('All');
  const [selectedLog, setSelectedLog] = useState<GxPAuditLog | null>(
    MOCK_GXP_AUDIT_LOGS[0] ?? null
  );
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isMerkleModalOpen, setIsMerkleModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Filter logs based on regulation and module
  const filteredLogs = useMemo(() => {
    return MOCK_GXP_AUDIT_LOGS.filter((log) => {
      const matchesReg = selectedReg === 'All' || log.regulation === selectedReg;
      const matchesMod = selectedModule === 'All' || log.module === selectedModule;
      return matchesReg && matchesMod;
    });
  }, [selectedReg, selectedModule]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Record ID,Timestamp,Actor,Role,Action,Module,Entity,Regulation,IP Address,SHA256 Hash,Severity,Diff Summary',
    ];
    const rows = filteredLogs.map(
      (l) =>
        `"${l.id}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.module}","${l.entityId}","${l.regulation}","${l.ipAddress}","${l.sha256Hash}","${l.severity}","${l.diffSummary.replace(/"/g, '""')}"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirage-gxp-21cfr-part11-audit-ledger-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startMerkleVerification = () => {
    setIsVerifyingChain(true);
    setIsMerkleModalOpen(true);
    setTimeout(() => {
      setIsVerifyingChain(false);
    }, 1200);
  };

  const columns: DataTableColumn<GxPAuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp & Action',
      sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-brand-navy flex items-center gap-1.5 text-xs">
            {row.action}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {row.timestamp}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.timestamp} - ${row.action}`,
    },
    {
      key: 'actorName',
      header: 'Signatory',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-brand-navy text-xs">{row.actorName}</div>
          <div className="text-[10px] font-mono text-brand-primary">{row.actorRole}</div>
        </div>
      ),
      csvValue: (row) => `${row.actorName} (${row.actorRole})`,
    },
    {
      key: 'module',
      header: 'Module & Entity',
      sortable: true,
      render: (row) => (
        <div className="max-w-[180px]">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
            {row.module}
          </span>
          <span className="text-xs text-brand-navy truncate block font-medium" title={row.entityId}>
            {row.entityId}
          </span>
        </div>
      ),
      csvValue: (row) => `${row.module} - ${row.entityId}`,
    },
    {
      key: 'regulation',
      header: 'Regulation',
      sortable: true,
      render: (row) => {
        const variant =
          row.regulation === 'FDA 21 CFR Part 11'
            ? 'regulatory'
            : row.regulation === 'EU GMP Annex 11'
            ? 'bioglass'
            : row.regulation === 'EDA GxP'
            ? 'in-spec'
            : 'neutral';
        return <StatusBadge variant={variant} size="sm">{row.regulation}</StatusBadge>;
      },
      csvValue: (row) => row.regulation,
    },
    {
      key: 'sha256Hash',
      header: 'SHA-256 Digest',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
          <Hash className="w-3 h-3 text-brand-primary shrink-0" />
          <span className="truncate max-w-[90px]" title={row.sha256Hash}>
            {row.sha256Hash.substring(0, 8)}…{row.sha256Hash.substring(row.sha256Hash.length - 6)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(row.sha256Hash, row.id);
            }}
            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-navy transition-colors"
            title="Copy SHA-256 hash"
          >
            {copiedHash === row.id ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
      csvValue: (row) => row.sha256Hash,
    },
    {
      key: 'actions',
      header: 'Audit Diff',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(row);
            setIsDiffModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-navy text-white hover:bg-brand-primary font-mono text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
        >
          <span>Diff</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase 5 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              21 CFR Part 11 Compliance
            </Badge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Regulatory Demo
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cryptographic SHA-256 Merkle Ledger Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            GxP Audit Trail & Electronic Signature Ledger
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Tamper-evident regulatory ledger recording every formulation mutation, cryo-quarantine lock, and syndicate HCP credentialing event.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={startMerkleVerification}
            className="border-brand-primary/40 text-brand-navy hover:bg-brand-primary/10"
          >
            <KeyRound className="w-4 h-4 mr-1.5 text-brand-primary" />
            Verify Merkle Chain
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDossierModalOpen(true)}
            className="border-slate-300 text-slate-700"
          >
            <Printer className="w-4 h-4 mr-1.5 text-slate-600" />
            Regulatory Dossier
          </Button>
          <Button variant="primary" size="sm" onClick={handleExportCsv}>
            <Download className="w-4 h-4 mr-1.5" />
            Export Signed CSV
          </Button>
        </div>
      </div>

      {/* Compliance Telemetry Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Total Audit Blocks
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {MOCK_GXP_AUDIT_LOGS.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sequential Blocks Linked
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Hash Collision Risk
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 mt-1 tabular-numbers font-mono">
            0.0000%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            SHA-256 Cryptographic Standard
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Governing Regimes
          </div>
          <div className="text-2xl font-heading font-black text-brand-primary mt-1 tabular-numbers">
            4 Frameworks
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            FDA Part 11 • EDA • EU • WHO
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Signatory Integrity
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            100% Bound
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold">
            Zero Unsigned Mutations
          </div>
        </div>
      </div>

      {/* Filter Tabs: Regulation & Module */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Filter By Regulatory Standard
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {REGULATIONS.map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => setSelectedReg(reg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedReg === reg
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Filter By Monitored Module
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {MODULES.map((mod) => (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setSelectedModule(mod)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedModule === mod
                      ? 'bg-brand-primary text-white shadow-sm font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: DataTable + Embedded Payload Diff Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive DataTable */}
        <div className="lg:col-span-7">
          <DataTable<GxPAuditLog>
            title="Chronological Audit Ledger"
            subtitle={`Showing ${filteredLogs.length} verified immutable records`}
            data={filteredLogs}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search actor, action, SHA-256 hash, or entity..."
            searchableKeys={['action', 'actorName', 'entityId', 'sha256Hash', 'module']}
            defaultPageSize={6}
            exportFileName="mirage-gxp-audit-ledger.csv"
            onRowClick={(row) => setSelectedLog(row)}
          />
        </div>

        {/* Right Column: 21 CFR Part 11 Electronic Signature & Payload Diff Inspector */}
        <div className="lg:col-span-5">
          {selectedLog ? (
            <div className="rounded-3xl bg-[#020F24] text-white p-6 border border-white/10 shadow-2xl space-y-5 sticky top-24">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-[#61C0E4]" />
                  <div>
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#61C0E4] block">
                      21 CFR Part 11 Electronic Record
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Block ID: {selectedLog.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDiffModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  Full Sheet
                  <ExternalLink className="w-3 h-3 text-[#61C0E4]" />
                </button>
              </div>

              {/* Signatory Metadata */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono text-[11px]">Authorized Signatory:</span>
                  <span className="font-bold text-white font-mono">{selectedLog.actorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono text-[11px]">Clearance Role:</span>
                  <span className="font-mono text-emerald-400 text-[11px] font-semibold">{selectedLog.actorRole}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono text-[11px]">Target Entity:</span>
                  <span className="font-mono text-white text-[11px] font-medium truncate max-w-[200px]" title={selectedLog.entityId}>
                    {selectedLog.entityId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono text-[11px]">Origin Terminal IP:</span>
                  <span className="font-mono text-sky-300 text-[11px]">{selectedLog.ipAddress}</span>
                </div>
              </div>

              {/* SHA-256 Digest Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                    SHA-256 Electronic Digest (Tamper Seal)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedLog.sha256Hash, 'inspector')}
                    className="text-[10px] font-mono text-[#61C0E4] hover:underline flex items-center gap-1"
                  >
                    {copiedHash === 'inspector' ? 'Copied!' : 'Copy Hash'}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-[#61C0E4]/30 font-mono text-[11px] text-[#61C0E4] break-all select-all">
                  {selectedLog.sha256Hash}
                </div>
              </div>

              {/* Diff Summary */}
              <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200">
                <span className="font-bold font-mono text-[10px] uppercase text-sky-400 block mb-0.5">
                  Action Summary
                </span>
                {selectedLog.diffSummary}
              </div>

              {/* JSON Diff Viewer */}
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    State Before Mutation (JSON)
                  </span>
                  <pre className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 font-mono text-[11px] text-rose-200 overflow-x-auto max-h-36">
                    {selectedLog.payloadBefore ?? '// Initial Creation (No Prior State)'}
                  </pre>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    State After Electronic Sign-Off (JSON)
                  </span>
                  <pre className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 font-mono text-[11px] text-emerald-200 overflow-x-auto max-h-36">
                    {selectedLog.payloadAfter ?? '// Record Purged or Neutral'}
                  </pre>
                </div>
              </div>

              {/* Legal Attestation Footer */}
              <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-slate-400 text-center leading-relaxed">
                Legally binding electronic signature under FDA 21 CFR Part 11.100 & EU Annex 11. Tamper-evident audit trail protected by cryptographic SHA-256 hash chain.
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <FileCode2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Select an audit log entry</p>
              <p className="text-xs text-slate-400">
                Click any row in the ledger to inspect the cryptographic electronic signature and JSON mutation diff.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Merkle Chain Verification Modal */}
      <ClinicalModal
        open={isMerkleModalOpen}
        onClose={() => setIsMerkleModalOpen(false)}
        title="Cryptographic Merkle Tree Chain Verification"
        subtitle="FDA 21 CFR Part 11 §11.10(a) & EU GMP Annex 11 Sequential Block Integrity"
        mode="dialog"
        maxWidthClass="max-w-2xl"
        gxpBadge="21 CFR PART 11 VERIFIED"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              Algorithm: SHA-256 Merkle Tree
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsMerkleModalOpen(false)}
            >
              Accept & Close Certificate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {isVerifyingChain ? (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-brand-primary animate-spin mx-auto" />
              <div className="text-sm font-bold text-brand-navy">
                Computing Sequential Block Hashes...
              </div>
              <div className="text-xs font-mono text-slate-400">
                Validating leaf hashes against Merkle root across {MOCK_GXP_AUDIT_LOGS.length} records
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">
                    Cryptographic Chain Integrity 100% Verified
                  </div>
                  <div className="mt-1 leading-relaxed">
                    All {MOCK_GXP_AUDIT_LOGS.length} audit blocks have been sequentially verified against the active Merkle root. Zero orphaned blocks, missing parent pointers, or hash collisions detected.
                  </div>
                </div>
              </div>

              {/* Merkle Root Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 uppercase font-bold text-[10px]">
                    Active Merkle Root Hash
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    ● CHAIN IN SPEC
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-[#61C0E4] break-all select-all">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>

              {/* Verified Block Sequence */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-brand-navy uppercase tracking-wider">
                  Sequential Block Verification
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {MOCK_GXP_AUDIT_LOGS.map((log, idx) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-mono font-bold text-brand-navy text-[11px]">
                            {log.action}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">
                            {log.id} • {log.timestamp}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500 hidden sm:inline">
                          {log.sha256Hash.substring(0, 10)}…
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ClinicalModal>

      {/* Slide-over Full Sheet Diff Modal */}
      <ClinicalModal
        open={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        title={selectedLog ? `21 CFR Part 11 Audit Inspection: ${selectedLog.action}` : 'Audit Inspection'}
        subtitle={selectedLog ? `Target: ${selectedLog.entityId} | Signatory: ${selectedLog.actorName}` : ''}
        mode="sheet"
        gxpBadge="21 CFR PART 11 IMMUTABLE"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiffModalOpen(false)}
            >
              Close Inspector
            </Button>
          </div>
        }
      >
        {selectedLog ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Signatory Information
                </span>
                <div className="font-bold text-brand-navy">{selectedLog.actorName}</div>
                <div className="text-slate-500 font-mono text-[11px]">{selectedLog.actorRole}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                  Regulatory Standard
                </span>
                <div className="font-bold text-brand-navy">{selectedLog.regulation}</div>
                <div className="text-slate-500 font-mono text-[11px]">Severity: {selectedLog.severity.toUpperCase()}</div>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1">
                SHA-256 Electronic Signature
              </span>
              <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-[#61C0E4] break-all">
                {selectedLog.sha256Hash}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
              <span className="font-bold uppercase font-mono text-[10px] text-sky-600 block mb-1">
                Mutation Diff Summary
              </span>
              {selectedLog.diffSummary}
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-rose-600 block mb-1">
                  — State Before Mutation (JSON)
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-rose-300 overflow-x-auto">
                  {selectedLog.payloadBefore ?? '// Initial State'}
                </pre>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 block mb-1">
                  + State After Electronic Sign-Off (JSON)
                </span>
                <pre className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-emerald-300 overflow-x-auto">
                  {selectedLog.payloadAfter ?? '// No Final State'}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </ClinicalModal>

      {/* Regulatory Dossier Preview Modal */}
      <ClinicalModal
        open={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="GxP Official Regulatory Compliance Dossier"
        subtitle="FDA 21 CFR Part 11 / Egyptian Drug Authority (EDA) Inspection Certificate"
        mode="dialog"
        maxWidthClass="max-w-4xl"
        gxpBadge="EDA & FDA CERTIFIED DOSSIER"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono text-slate-500">
              Mirage GxP Certificate ID: MIR-2026-REG-0992
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Certificate
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsDossierModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        }
      >
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6 text-brand-navy">
          {/* Certificate Header */}
          <div className="flex items-center justify-between border-b pb-4 border-slate-200">
            <div>
              <div className="font-heading font-black text-xl tracking-tight text-brand-navy">
                MIRAGE PHARMACEUTICALS S.A.E.
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Quality Assurance & Regulatory Compliance Division • Cairo, Egypt
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                AUDIT PASS: 100% IN-SPEC
              </span>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Generated: 2026-10-20
              </div>
            </div>
          </div>

          {/* Statement */}
          <div className="text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              This document certifies that the electronic records, cold-chain sensor streams, formulation releases, and healthcare professional credentialing verifications logged in the Mirage GxP Audit Trail comply with the statutory requirements of <strong>FDA 21 CFR Part 11</strong>, <strong>Egyptian Drug Authority (EDA) Good Manufacturing & Distribution Practices</strong>, and <strong>EU GMP Annex 11</strong>.
            </p>
            <p>
              All mutations are bound to individual authenticated signatories with cryptographically enforced SHA-256 nonces and Merkle chain root verification.
            </p>
          </div>

          {/* Audit Metrics Table */}
          <div className="rounded-xl border border-slate-200 overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-thin text-xs">
            <table className="w-full text-left min-w-[540px]">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-3 whitespace-nowrap">Audit Scope</th>
                  <th className="p-3 whitespace-nowrap">Records Inspected</th>
                  <th className="p-3 whitespace-nowrap">Cryptographic Status</th>
                  <th className="p-3 whitespace-nowrap">Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Cold-Chain Cryo-Telemetric Log</td>
                  <td className="p-3 whitespace-nowrap">4 Depots / 100+ Hours</td>
                  <td className="p-3 text-emerald-600 whitespace-nowrap">VERIFIED (SHA-256)</td>
                  <td className="p-3 whitespace-nowrap">Zero Excursion Discrepancies</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Formulation GS1 Serialization</td>
                  <td className="p-3 whitespace-nowrap">7 Active Products</td>
                  <td className="p-3 text-emerald-600 whitespace-nowrap">VERIFIED (SHA-256)</td>
                  <td className="p-3 whitespace-nowrap">100% DataMatrix Validated</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold whitespace-nowrap">Syndicate HCP Credentialing</td>
                  <td className="p-3 whitespace-nowrap">All Submissions</td>
                  <td className="p-3 text-emerald-600 whitespace-nowrap">VERIFIED (SHA-256)</td>
                  <td className="p-3 whitespace-nowrap">Syndicate IDs Cross-Referenced</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs font-mono">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                QA & GxP Validation Lead
              </div>
              <div className="font-bold text-brand-navy">Eng. Karim Hassan</div>
              <div className="text-[10px] text-emerald-600">Digitally Signed: 2026-10-20 14:50 UTC</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                Medical & Regulatory Director
              </div>
              <div className="font-bold text-brand-navy">Dr. Nadia Mansour</div>
              <div className="text-[10px] text-emerald-600">Digitally Signed: 2026-10-20 14:55 UTC</div>
            </div>
          </div>
        </div>
      </ClinicalModal>
    </div>
  );
}
