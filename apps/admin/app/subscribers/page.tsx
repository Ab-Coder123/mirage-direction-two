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
  Send,
  Users,
  CheckCircle2,
  Sparkles,
  Download,
  ExternalLink,
  Plus,
  Radio,
  Eye,
} from 'lucide-react';
import {
  MOCK_SUBSCRIBERS,
  MOCK_CAMPAIGNS,
  type SubscriberRecord,
  type CampaignDispatch,
} from '@mirage/types';

const ROLES = [
  'All',
  'Physician',
  'Pharmacist',
  'Pediatrician',
  'Patient',
  'Institutional Investor',
] as const;

export default function NewsletterDispatchPage() {
  const [subscribers] = useState<SubscriberRecord[]>(MOCK_SUBSCRIBERS);
  const [campaigns, setCampaigns] = useState<CampaignDispatch[]>(MOCK_CAMPAIGNS);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<string>(
    MOCK_SUBSCRIBERS[0]?.id ?? 'sub-01'
  );
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Modal States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Composer Form State
  const [composerSubject, setComposerSubject] = useState(
    'Clinical Evidence Digest: L-Methylfolate & Vitamin B12 Bioavailability in Maternal Care'
  );
  const [composerSegment, setComposerSegment] = useState(
    'Verified Physicians & OB/GYN Specialists'
  );
  const [composerBody, setComposerBody] = useState(
    'Dear {{DoctorName}},\n\nMirage Pharmaceuticals is pleased to share our latest double-blind peer-reviewed findings on bioactive Folate B12 administration.\n\nStudy DOI: {{ClinicalStudyDOI}}\nRegulatory Batch Reference: BATCH-FB-2026-019'
  );

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(
      (s) => roleFilter === 'All' || s.role === roleFilter
    );
  }, [subscribers, roleFilter]);

  const activeSubscriber = useMemo(() => {
    return (
      subscribers.find((s) => s.id === selectedSubscriberId) ??
      filteredSubscribers[0] ??
      subscribers[0]
    );
  }, [subscribers, selectedSubscriberId, filteredSubscribers]);

  const handleDispatchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerSubject.trim()) return;

    const newCmp: CampaignDispatch = {
      id: `cmp-${Date.now()}`,
      subject: composerSubject,
      audienceSegment: composerSegment,
      sentAt: '2026-10-20 15:35',
      recipientsCount: 640,
      openRate: '78.2% (Live)',
      clickRate: '31.5%',
      status: 'Dispatched',
    };

    setCampaigns((prev) => [newCmp, ...prev]);
    setIsComposerOpen(false);
    setDispatchSuccess(
      `Broadcast "${composerSubject}" successfully dispatched to ${composerSegment}. 21 CFR Part 11 audit hash logged.`
    );
    setTimeout(() => setDispatchSuccess(null), 4000);
  };

  const handleExportCsv = () => {
    const headers = [
      'ID,Full Name,Email,Role,Specialty / Interest,Governorate,Subscribed Date,Status,Open Rate Percent',
    ];
    const rows = subscribers.map(
      (s) =>
        `"${s.id}","${s.fullName}","${s.email}","${s.role}","${s.specialtyOrInterest}","${s.governorate}","${s.subscribedAt}","${s.status}","${s.openRatePercent}%"`
    );
    const blob = new Blob([headers.concat(rows).join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirage-subscribers-registry-2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: DataTableColumn<SubscriberRecord>[] = [
    {
      key: 'fullName',
      header: 'Subscriber & Contact',
      sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-heading font-bold text-brand-navy text-xs">
            {row.fullName}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {row.email}
          </div>
        </div>
      ),
      csvValue: (row) => `${row.fullName} (${row.email})`,
    },
    {
      key: 'role',
      header: 'Audience Role',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-brand-navy block">
            {row.role}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.specialtyOrInterest}
          </span>
        </div>
      ),
      csvValue: (row) => `${row.role} - ${row.specialtyOrInterest}`,
    },
    {
      key: 'governorate',
      header: 'Governorate',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-brand-navy">
          {row.governorate}
        </span>
      ),
      csvValue: (row) => row.governorate,
    },
    {
      key: 'openRatePercent',
      header: 'Engagement',
      sortable: true,
      render: (row) => (
        <div className="space-y-1">
          <div className="font-mono text-xs font-bold text-brand-primary">
            {row.openRatePercent}% Open
          </div>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full"
              style={{ width: `${row.openRatePercent}%` }}
            />
          </div>
        </div>
      ),
      csvValue: (row) => `${row.openRatePercent}%`,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => {
        const variant =
          row.status === 'Active'
            ? 'in-spec'
            : row.status === 'Bounced'
            ? 'caution'
            : 'excursion';
        return <StatusBadge variant={variant} size="sm">{row.status}</StatusBadge>;
      },
      csvValue: (row) => row.status,
    },
    {
      key: 'actions',
      header: 'Profile',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSubscriberId(row.id);
            setIsProfileModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-brand-navy text-white hover:bg-brand-primary font-mono text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 ml-auto"
        >
          <span>Profile</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Phase 9 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Audience &amp; Newsletter Dispatch
            </Badge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Broadcast Demo
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              14,280 Double Opt-In Subscribers Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Audience Intelligence & Scientific Broadcast Center
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Segment medical practitioners and patients to dispatch clinical monographs, cold-chain bulletins, and Naturals 4be updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsComposerOpen(true)}
            className="bg-brand-primary hover:bg-brand-navy text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Compose Clinical Bulletin
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="border-slate-300">
            <Download className="w-4 h-4 mr-1.5" />
            Export Subscriber Directory
          </Button>
        </div>
      </div>

      {dispatchSuccess ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      ) : null}

      {/* High-Density Biomedical Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-primary font-bold flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Verified Audience
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            14,280
          </div>
          <div className="text-[10px] text-emerald-600 font-mono mt-0.5 font-bold">
            +184 this week
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-600 font-bold flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Clinical Open Rate
          </div>
          <div className="text-2xl font-heading font-black text-emerald-600 mt-1 tabular-numbers font-mono">
            78.4%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            Peer-reviewed email benchmark
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-brand-navy font-bold flex items-center gap-1">
            <Send className="w-3.5 h-3.5" /> Total Dispatches
          </div>
          <div className="text-2xl font-heading font-black text-brand-navy mt-1 tabular-numbers">
            {campaigns.length} Bulletins
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            E-prescribing monographs
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-600 font-bold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> Deliverability
          </div>
          <div className="text-2xl font-heading font-black text-brand-primary mt-1 tabular-numbers font-mono">
            99.6%
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            DKIM / SPF Signed
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-2">
            Filter Audience Segment:
          </span>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                roleFilter === r
                  ? 'bg-brand-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive DataTable */}
        <div className="lg:col-span-7">
          <DataTable<SubscriberRecord>
            title="Subscriber Directory"
            subtitle={`Showing ${filteredSubscribers.length} verified email recipients`}
            data={filteredSubscribers}
            columns={columns}
            rowKey={(r) => r.id}
            searchPlaceholder="Search subscriber by name, email, or role..."
            searchableKeys={['fullName', 'email', 'role', 'specialtyOrInterest', 'governorate']}
            defaultPageSize={6}
            exportFileName="mirage-subscribers.csv"
            onRowClick={(row) => setSelectedSubscriberId(row.id)}
          />
        </div>

        {/* Right Column: Recent Scientific Broadcasts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-heading font-black text-lg text-brand-navy">
                  Dispatched Clinical Bulletins
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {campaigns.length} campaigns logged
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-navy font-mono text-[11px] font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-brand-primary" />
                New Bulletin
              </button>
            </div>

            <div className="space-y-3">
              {campaigns.map((cmp) => (
                <div
                  key={cmp.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-heading font-bold text-xs text-brand-navy leading-snug">
                      {cmp.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold shrink-0">
                      {cmp.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200/60">
                    <span className="text-brand-primary font-semibold">
                      {cmp.audienceSegment}
                    </span>
                    <span>{cmp.sentAt}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Recipients</span>
                      <span className="font-bold text-brand-navy">{cmp.recipientsCount}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Open Rate</span>
                      <span className="font-bold text-emerald-600">{cmp.openRate}</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">CTR</span>
                      <span className="font-bold text-brand-primary">{cmp.clickRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Composer Modal */}
      <ClinicalModal
        open={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        title="Compose Scientific Clinical Broadcast"
        subtitle="GDPR / 21 CFR Part 11 Authenticated Electronic Dispatch"
        mode="dialog"
        maxWidthClass="max-w-2xl"
        gxpBadge="AUTHENTICATED DISPATCH"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsComposerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDispatchCampaign}
              className="bg-brand-primary hover:bg-brand-navy text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Dispatch Broadcast Now
            </Button>
          </div>
        }
      >
        <form onSubmit={handleDispatchCampaign} className="space-y-4 text-xs">
          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Broadcast Subject Line *
            </label>
            <input
              type="text"
              required
              value={composerSubject}
              onChange={(e) => setComposerSubject(e.target.value)}
              placeholder="e.g. Clinical Evidence Digest: L-Methylfolate & Vitamin B12"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary font-medium"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1">
              Target Audience Segment *
            </label>
            <select
              value={composerSegment}
              onChange={(e) => setComposerSegment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy focus:outline-none focus:border-brand-primary"
            >
              <option value="Verified Physicians & OB/GYN Specialists">Verified Physicians & OB/GYN Specialists</option>
              <option value="Hospital Clinical Pharmacists">Hospital Clinical Pharmacists</option>
              <option value="Pediatricians & Neonatologists">Pediatricians & Neonatologists</option>
              <option value="Institutional Healthcare Investors">Institutional Healthcare Investors</option>
              <option value="All Verified Subscribers">All Verified Subscribers (14,280 recipients)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] uppercase font-bold text-slate-500">
                Scientific Body & Clinical Narrative
              </label>
              <span className="text-[10px] font-mono text-brand-primary">
                Supports Markdown & Variables
              </span>
            </div>
            <textarea
              rows={6}
              value={composerBody}
              onChange={(e) => setComposerBody(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-brand-navy font-mono text-xs focus:outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] leading-relaxed flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Automated Variable Interpolation Active:</span>
              <br />
              Tokens like <code className="bg-sky-100 px-1 py-0.5 rounded font-mono font-bold">{'{{DoctorName}}'}</code> and <code className="bg-sky-100 px-1 py-0.5 rounded font-mono font-bold">{'{{ClinicalStudyDOI}}'}</code> are replaced dynamically for each recipient based on Syndicate credentials.
            </div>
          </div>
        </form>
      </ClinicalModal>

      {/* Subscriber Profile Slide-Over Sheet */}
      <ClinicalModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title={activeSubscriber ? `Subscriber Dossier: ${activeSubscriber.fullName}` : 'Subscriber'}
        subtitle={activeSubscriber ? `${activeSubscriber.role} • ${activeSubscriber.governorate}` : ''}
        mode="sheet"
        gxpBadge="SUBSCRIBER AUDIENCE RECORD"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileModalOpen(false)}
            >
              Close Dossier
            </Button>
          </div>
        }
      >
        {activeSubscriber ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-brand-navy text-white space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#61C0E4]">
                Audience Member
              </div>
              <div className="font-heading font-black text-xl">{activeSubscriber.fullName}</div>
              <div className="font-mono text-slate-300">
                {activeSubscriber.role} • {activeSubscriber.governorate} Governorate
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                Engagement: {activeSubscriber.openRatePercent}% Open Rate
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                Primary Contact
              </span>
              <div className="font-bold text-brand-navy font-mono">
                {activeSubscriber.email}
              </div>
              <div className="text-slate-400 font-mono text-[10px]">
                Subscribed since: {activeSubscriber.subscribedAt}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono font-bold uppercase text-slate-500 text-[10px] block">
                Clinical Interest & Specialization
              </span>
              <div className="font-semibold text-brand-navy">
                {activeSubscriber.specialtyOrInterest}
              </div>
            </div>
          </div>
        ) : null}
      </ClinicalModal>
    </div>
  );
}
