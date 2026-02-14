import Link from 'next/link';
import { Github, TrendingUp, Zap, Brain, ArrowRight, Activity, BarChart3, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-500/[0.07] rounded-full blur-[120px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Meridian</span>
          </div>
          <Link
            href="/setup"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] text-violet-300 text-xs font-medium mb-8 tracking-wide uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              Engineering Intelligence
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight animate-fade-in-up stagger-1">
            Your GitHub,{' '}
            <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-teal-400 bg-clip-text text-transparent">
              decoded
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            Transform commits and pull requests into clear, actionable insights.
            Track what matters. Ship with confidence.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-medium bg-violet-600 hover:bg-violet-500 transition-all duration-300 shadow-glow hover:shadow-glow-lg"
            >
              <Github className="h-4 w-4" />
              Start Analyzing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-5 mt-28 max-w-4xl mx-auto">
          {[
            {
              icon: TrendingUp,
              title: 'Track Metrics',
              desc: 'Cycle time, review velocity, and PR throughput — visualized beautifully.',
              color: 'violet',
            },
            {
              icon: Brain,
              title: 'Smart Insights',
              desc: 'Pattern detection backed by real data. No noise, no hallucinations.',
              color: 'teal',
            },
            {
              icon: Zap,
              title: 'Instant Setup',
              desc: 'Paste your token, sync repos. Under 60 seconds to your first dashboard.',
              color: 'amber',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className={`glass-card noise p-6 animate-fade-in-up stagger-${i + 4}`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'violet'
                    ? 'bg-violet-500/10 text-violet-400'
                    : feature.color === 'teal'
                    ? 'bg-teal-500/10 text-teal-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1.5 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 max-w-3xl mx-auto animate-fade-in-up stagger-6">
          <div className="glass-card p-6 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: BarChart3, value: '7+', label: 'Key Metrics' },
              { icon: Shield, value: 'AES-256', label: 'Encrypted Tokens' },
              { icon: Zap, value: '<60s', label: 'Setup Time' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <stat.icon className="h-5 w-5 text-violet-400/60" />
                <span className="text-2xl font-bold text-white font-mono-num">{stat.value}</span>
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-28 max-w-3xl mx-auto animate-fade-in-up stagger-6">
          <h2 className="text-2xl font-semibold text-white text-center mb-14 tracking-tight">
            Three steps to clarity
          </h2>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-5 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-violet-500/30 via-violet-500/20 to-violet-500/30" />

            {[
              { num: '01', title: 'Connect', desc: 'Create a GitHub token with repo read access' },
              { num: '02', title: 'Sync', desc: 'Meridian pulls your PRs, reviews, and commits' },
              { num: '03', title: 'Discover', desc: 'View metrics and intelligent recommendations' },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-mono font-medium mb-4 relative z-10">
                  {step.num}
                </div>
                <h4 className="text-white font-medium mb-1.5">{step.title}</h4>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-12">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-violet-400/50" />
            <p className="text-xs text-slate-500">
              Built with Next.js, Supabase & Prisma
            </p>
          </div>
          <p className="text-xs text-slate-500">Meridian</p>
        </div>
      </footer>
    </div>
  );
}
