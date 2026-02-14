'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Key, ArrowRight, CheckCircle, AlertCircle, Loader2, Activity, ExternalLink, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SetupPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect');
      }

      setUserName(data.user?.login || '');
      setStatus('success');

      // Redirect to dashboard after brief success state
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/[0.06] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Meridian</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Success state */}
          {status === 'success' ? (
            <div className="glass-card p-8 text-center animate-fade-in-up">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connected!</h2>
              <p className="text-slate-400">
                Welcome, <span className="text-white font-medium">{userName}</span>. Redirecting to dashboard...
              </p>
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-5 w-5 text-violet-400 animate-spin" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8 animate-fade-in-up">
                <div className="h-14 w-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                  <Key className="h-7 w-7 text-violet-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Connect GitHub</h1>
                <p className="text-slate-400 text-sm">
                  Enter your Personal Access Token to start analyzing your repos
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="animate-fade-in-up stagger-1">
                <div className="glass-card p-6 space-y-5">
                  {/* Token input */}
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-slate-300 mb-2">
                      GitHub Personal Access Token
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        id="token"
                        type="password"
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          if (status === 'error') setStatus('idle');
                        }}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all font-mono"
                        autoComplete="off"
                        spellCheck={false}
                        minLength={30}
                        required
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'loading' || token.length < 30}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-white font-medium bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-glow hover:shadow-glow-lg disabled:shadow-none"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Help text */}
              <div className="mt-6 glass-card p-5 animate-fade-in-up stagger-2">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-violet-400" />
                  <h3 className="text-sm font-medium text-white">How to get a token</h3>
                </div>
                <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside">
                  <li>
                    Go to{' '}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 inline-flex items-center gap-1"
                    >
                      GitHub Token Settings <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Select scopes: <code className="text-violet-300/70 bg-violet-500/10 px-1 rounded">repo</code> (read access)</li>
                  <li>Generate and paste the token above</li>
                </ol>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  Your token is encrypted with AES-256-GCM before storage
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
