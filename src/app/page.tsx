import Link from 'next/link';
import { Github, TrendingUp, Zap, Brain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Meridian</span>
          </div>
          <Link 
            href="/setup" 
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your GitHub Activity,
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Analyzed by AI
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Transform Git commits and pull requests into actionable insights. 
            Track metrics, detect patterns, and improve your engineering workflow—all in one beautiful dashboard.
          </p>

          <Link 
            href="/setup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60"
          >
            <Github className="h-5 w-5" />
            Start Analyzing Your Repos
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Track Metrics
            </h3>
            <p className="text-slate-400">
              Monitor cycle time, review velocity, and PR throughput with beautiful charts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              AI Insights
            </h3>
            <p className="text-slate-400">
              Get intelligent recommendations backed by real metrics—no hallucinations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Simple Setup
            </h3>
            <p className="text-slate-400">
              Just paste your GitHub token and start syncing. No complex OAuth flows.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Connect GitHub
                </h4>
                <p className="text-slate-400">
                  Create a personal access token with repo read permissions
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Sync Your Data
                </h4>
                <p className="text-slate-400">
                  Meridian fetches your PRs, commits, and reviews
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">
                  Get Insights
                </h4>
                <p className="text-slate-400">
                  View metrics and AI-powered recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24">
        <div className="container mx-auto px-4 py-8 text-center text-slate-400">
          <p>Built with Next.js, Supabase, and Claude AI</p>
        </div>
      </footer>
    </div>
  );
}
