'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { Button, Card } from '@mirage/ui';
import { loginAdminAction } from './actions';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginAdminAction({ email, password });
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : null;
      const fromPath = params?.get('from');
      const safeTarget =
        fromPath && fromPath.startsWith('/') && !fromPath.startsWith('//')
          ? fromPath
          : '/';

      router.push(safeTarget);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Server authentication failed'
      );
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
            Server-verified clinical &amp; regulatory authentication gateway
          </p>
        </div>

        <Card className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {error && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-rose-400 text-xs"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Operator Email
              </label>
              <div className="relative">
                <input
                  id="admin-email-input"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="operator@miragepharma.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Passphrase / Credential Token
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Enter server-configured passphrase"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/70 text-[11px] text-slate-400 flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-brand-cyan-light shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200 block">
                  Server-Enforced Role &amp; Session Signing
                </span>
                Operator role clearance is assigned strictly from server-side configuration and verified via HMAC-SHA256 HttpOnly cookies.
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
