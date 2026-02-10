'use client';

import { useState } from 'react';
import { Github, Lock, ExternalLink, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Connect Your GitHub
          </h1>
          <p className="text-slate-400">
            We'll securely encrypt and store your token to sync your repositories
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {/* Instructions */}
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              How to create a GitHub token
            </h3>
            <ol className="text-sm text-slate-300 space-y-2 ml-6 list-decimal">
              <li>
                Go to{' '}
                <a
                  href="https://github.com/settings/tokens/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                >
                  GitHub Settings → Tokens
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Give it a name like "Meridian Dashboard"</li>
              <li>
                Select scopes: <code className="bg-white/10 px-1 rounded">repo</code> (for private repos) or{' '}
                <code className="bg-white/10 px-1 rounded">public_repo</code> (for public only)
              </li>
              <li>Click "Generate token" and copy it</li>
            </ol>
          </div>

          {/* Token Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-white mb-2">
                GitHub Personal Access Token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={40}
              />
              <p className="text-xs text-slate-400 mt-1">
                Your token is encrypted with AES-256-GCM before storage
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-5 w-5" />
                  Connect GitHub
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-slate-400 text-center">
              🔒 Your token is never logged or shared. It's encrypted at rest and only used to fetch your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
