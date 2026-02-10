'use client';

import { useState } from 'react';
import { Github, Lock, ExternalLink, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SetupPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save token');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
      {/* Ambient glow */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-violet-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="container mx-auto px-6 py-5 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Meridian</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-lg w-full animate-fade-in-up">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-5">
              <Github className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
              Connect your GitHub
            </h1>
            <p className="text-sm text-slate-400">
              Securely link your account to start syncing repositories
            </p>
          </div>

          {/* Card */}
          <div className="glass-card noise p-7">
            {/* Instructions */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 mb-6">
              <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-violet-400" />
                Create a personal access token
              </h3>
              <ol className="text-xs text-slate-400 space-y-2.5 ml-5 list-decimal leading-relaxed">
                <li>
                  Visit{' '}
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
                  >
                    GitHub Settings → Tokens
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </li>
                <li>Name it something like &quot;Meridian&quot;</li>
                <li>
                  Select scope:{' '}
                  <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-violet-300 font-mono text-[11px]">repo</code>
                  {' '}or{' '}
                  <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-violet-300 font-mono text-[11px]">public_repo</code>
                </li>
                <li>Generate and copy the token</li>
              </ol>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-xs font-medium text-slate-300 mb-2 uppercase tracking-wider">
                  Token
                </label>
                <input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 font-mono transition-all duration-300"
                  required
                  minLength={40}
                />
                <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  Encrypted with AES-256-GCM before storage
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-red-400 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow hover:shadow-glow-lg"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect GitHub
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Your token is never logged or shared. It&apos;s encrypted at rest and only used to fetch your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
