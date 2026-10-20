'use client';

import React, { useState } from 'react';
import {
  Badge,
  Button,
} from '@mirage/ui';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Server,
} from 'lucide-react';
import { MOCK_RBAC_ROLES, type RBACRoleDefinition } from '@mirage/types';

export default function SecurityRBACSettingsPage() {
  const [roles, setRoles] = useState<RBACRoleDefinition[]>(MOCK_RBAC_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    MOCK_RBAC_ROLES[0]?.id ?? 'role-super-admin'
  );
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [cfrSignatureLock, setCfrSignatureLock] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('15');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const activeRole =
    roles.find((r) => r.id === selectedRoleId) ?? roles[0];

  const togglePermission = (
    roleId: string,
    modIndex: number,
    field: 'read' | 'write' | 'approve' | 'export'
  ) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const nextPerms = r.permissions.map((p, idx) =>
          idx === modIndex ? { ...p, [field]: !p[field] } : p
        );
        return { ...r, permissions: nextPerms };
      })
    );
    setSavedNotice('RBAC Clearance Matrix updated & signed in 21 CFR Part 11 Ledger.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Phase 10 Header */}
      <div className="hud-glass p-6 rounded-3xl border border-white/80 shadow-hud-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">
              Phase 10 • Security Hardening & RBAC Matrix
            </Badge>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              ● Edge Middleware Security Headers Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl text-brand-navy">
            Role-Based Access Control (RBAC) & GxP Security Policies
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Configure multi-tier operator clearance levels, 21 CFR Part 11 dual-signature locks, hardware MFA policies, and Edge security headers.
          </p>
        </div>

        {savedNotice ? (
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        ) : null}
      </div>

      {/* Role Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {roles.map((role) => {
          const isSelected = activeRole?.id === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              className={`text-left p-5 rounded-3xl border transition-all space-y-2.5 ${
                isSelected
                  ? 'bg-white border-brand-primary ring-2 ring-brand-primary/15 shadow-md'
                  : 'bg-white/85 border-slate-200/80 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-navy text-white font-mono text-[10px] font-bold">
                  {role.activeUsersCount} Active Operators
                </span>
                <Lock className="w-4 h-4 text-brand-primary" />
              </div>

              <h2 className="font-heading font-extrabold text-base text-brand-navy">
                {role.roleName}
              </h2>
              <p className="text-[11px] font-mono text-brand-primary font-bold">
                {role.clearanceLevel}
              </p>
              <p className="text-xs text-slate-500 line-clamp-2">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Split: Interactive Permission Matrix + System Hardening Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {activeRole ? (
          <div className="lg:col-span-8 rounded-3xl bg-white border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-bold text-base text-brand-navy">
                  Permission Matrix — {activeRole.roleName}
                </h3>
                <p className="text-xs text-slate-500">
                  Click any cell to toggle granular module capabilities for this clearance tier
                </p>
              </div>
              <span className="font-mono text-[11px] text-brand-primary font-bold">
                {activeRole.clearanceLevel}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase">
                  <tr>
                    <th className="p-3">Operational Module</th>
                    <th className="p-3 text-center">Read</th>
                    <th className="p-3 text-center">Write / Mutate</th>
                    <th className="p-3 text-center">GxP Sign-Off</th>
                    <th className="p-3 text-center">Export Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeRole.permissions.map((perm, idx) => (
                    <tr key={perm.module} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-brand-navy">
                        {perm.module}
                      </td>
                      {(['read', 'write', 'approve', 'export'] as const).map(
                        (field) => (
                          <td key={field} className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                togglePermission(activeRole.id, idx, field)
                              }
                              className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label={`Toggle ${field} for ${perm.module}`}
                            >
                              {perm[field] ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-slate-300" />
                              )}
                            </button>
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Right Column: Edge Security & 21 CFR Part 11 Controls */}
        <div className="lg:col-span-4 rounded-3xl bg-[#020F24] text-white p-6 border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Server className="w-4 h-4 text-[#61C0E4]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#61C0E4]">
              Edge Security & Compliance Gates
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">
                  Hardware WebAuthn / FIDO2 MFA
                </span>
                <span className="text-[11px] text-slate-400">
                  Required for all Level 4 & Level 5 GxP signatories
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnforced((v) => !v)}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold ${
                  mfaEnforced
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {mfaEnforced ? 'ENFORCED' : 'OPTIONAL'}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div>
                <span className="font-bold text-white block">
                  21 CFR Part 11 Dual-Signature Lock
                </span>
                <span className="text-[11px] text-slate-400">
                  Require QA counter-signature on thermal excursions
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCfrSignatureLock((v) => !v)}
                className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold ${
                  cfrSignatureLock
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {cfrSignatureLock ? 'ACTIVE' : 'BYPASSED'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="font-bold text-white block">
                Idle Session Auto-Lockout (Minutes)
              </span>
              <select
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#041B3B] border border-white/15 font-mono text-xs text-[#61C0E4]"
              >
                <option value="10">10 Minutes (Strict Cryo-Terminal)</option>
                <option value="15">15 Minutes (FDA 21 CFR Standard)</option>
                <option value="30">30 Minutes (Standard Workstation)</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => {
              setSavedNotice(
                'Edge Security Policies & 21 CFR Part 11 Locks committed.'
              );
              setTimeout(() => setSavedNotice(null), 3500);
            }}
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            Commit Security Policy
          </Button>
        </div>
      </div>
    </div>
  );
}
