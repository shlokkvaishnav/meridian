'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Key, ArrowRight, CheckCircle, AlertCircle, Loader2, Activity, ExternalLink, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SetupPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [validationError, setValidationError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setValidationError('Token is required');
      return;
    }

    // Basic GitHub token format validation
    if (token.trim().length < 20) {
      setValidationError('Invalid token format. Tokens are typically 40+ characters.');
      return;
    }

    setStatus('loading');
    setError('');
    setValidationError('');

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

  const handleTokenChange = (value: string) => {
    setToken(value);
    setValidationError('');
    setError('');
  };

  const isValid = token.trim().length >= 20 && !validationError && !error;
  const hasError = !!validationError || status === 'error';

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
          
          {/* Step indicator */}
          <div className="text-xs text-slate-500 font-medium">
            Step <span className="text-violet-400">1</span> of 3
          </div>
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

              {/* Security Trust Signal */}
              <div className="glass-card p-4 mb-6 border border-emerald-500/20 bg-emerald-500/[0.03] animate-fade-in-up stagger-1">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-300 mb-1">Enterprise-Grade Security</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your token is encrypted with <span className="text-emerald-400 font-medium">AES-256</span> and never exposed in logs or analytics. We store only what's needed to sync your data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="animate-fade-in-up stagger-2">
                <div className="glass-card p-6 space-y-5 border border-white/[0.08]">
                  {/* Token input */}
                  <div>
                    <label htmlFor="token" className="block text-sm font-medium text-slate-300 mb-2">
                      GitHub Personal Access Token
                    </label>
                    <div className="relative">
                      <input
                        id="token"
                        type={showToken ? 'text' : 'password'}
                        value={token}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        className={`w-full px-4 py-3 pr-12 bg-black/30 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                          hasError
                            ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500'
                            : isValid
                            ? 'border-emerald-500/50 focus:ring-emerald-500/20 focus:border-emerald-500'
                            : 'border-white/[0.08] focus:ring-violet-500/20 focus:border-violet-500'
                        }`}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        disabled={status === 'loading'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationError && (
                      <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        {validationError}
                      </p>
                    )}
                    {error && (
                      <p className="mt-2 text-xs text-red-400 flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </p>
                    )}
                    {isValid && (
                      <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle className="h-3 w-3" />
                        Token format looks good
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:from-violet-600/50 disabled:to-violet-500/50 disabled:cursor-not-allowed transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:shadow-glow w-full max-w-[300px]"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          Connect GitHub
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* How to get token */}
              <div className="mt-8 glass-card p-5 space-y-4 animate-fade-in-up stagger-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-violet-400" />
                  How to get your token
                </h3>
                
                <div className="space-y-3 text-xs text-slate-400">
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400 font-semibold text-[10px]">
                      1
                    </div>
                    <p className="pt-0.5">
                      Go to{' '}
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo,read:org,user:email&description=Meridian"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 font-medium underline decoration-violet-500/30 hover:decoration-violet-400 transition-colors"
                      >
                        GitHub Token Settings
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400 font-semibold text-[10px]">
                      2
                    </div>
                    <p className="pt-0.5">
                      Grant <code className="px-1.5 py-0.5 rounded bg-black/40 text-violet-300 font-mono text-[10px] border border-violet-500/20">repo</code> access for analyzing repositories
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400 font-semibold text-[10px]">
                      3
                    </div>
                    <p className="pt-0.5">
                      Generate token and paste it above
                    </p>
                  </div>
                </div>
              </div>

              {/* Back to home link */}
              <div className="mt-6 text-center">
                <Link 
                  href="/" 
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                >
                  ← Back to home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
