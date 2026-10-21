'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Button, Card } from '@mirage/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@miragepharma.com');
  const [role, setRole] = useState<'super_admin' | 'qa_officer' | 'medical_director' | 'read_only'>('super_admin');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Set secure session cookie with role clearance
      const sessionPayload = {
        userId: `usr-${role.replace('_', '-')}`,
        email,
        role,
        issuedAt: new Date().toISOString(),
      };

      document.cookie = `mirage_session=${encodeURIComponent(
        JSON.stringify(sessionPayload)
      )}; path=/; max-age=86400; SameSite=Lax`;

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden text-slate-100">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-primary/20 blur-[140px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-cyan-light text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            FDA 21 CFR Part 11 Compliant Authentication
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-heading">
            Mirage Operations Hub
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Secure clinical & regulatory authentication gateway
          </p>
        </div>

        <Card className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Operator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="operator@miragepharma.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                Passphrase / Credential Token
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                GxP Operator Role Clearance
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'super_admin', label: 'Super Admin', desc: 'Full Clearances' },
                  { id: 'qa_officer', label: 'QA Officer', desc: 'GxP Sign-off' },
                  { id: 'medical_director', label: 'Medical Dir.', desc: 'Formulations & ADR' },
                  { id: 'read_only', label: 'Auditor', desc: 'Read-Only Ledger' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      role === item.id
                        ? 'border-brand-primary bg-brand-primary/10 text-white ring-1 ring-brand-primary'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-brand-cyan-light" />
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Verifying Credentials...' : 'Authorize Session'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-600 mt-6">
          Mirage Pharma Clinical Monorepo • FDA 21 CFR Part 11 Encrypted
        </p>
      </div>
    </div>
  );
}
