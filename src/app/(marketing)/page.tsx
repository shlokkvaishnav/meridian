'use client';

import Link from 'next/link';
import { Github, TrendingUp, Zap, Brain, ArrowRight, Activity, BarChart3, Shield, Key, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { InteractiveHero } from '@/components/marketing/InteractiveHero';
import { PricingToggle } from '@/components/marketing/PricingToggle';
import { FeatureComparison } from '@/components/marketing/FeatureComparison';
import { TestimonialsCarousel } from '@/components/marketing/TestimonialsCarousel';
import { TrustedBy } from '@/components/marketing/TrustedBy';
import { SecurityBadge } from '@/components/marketing/SecurityBadge';
import { useState } from 'react';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
    }
    return monthlyPrice;
  };

  const formatPrice = (price: number) => {
    if (isAnnual) {
      return `$${price}/yr`;
    }
    return `$${price}/mo`;
  };

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
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm text-slate-400 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/setup" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/setup"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-white border border-violet-500/30 hover:border-violet-500/50 bg-violet-600/20 hover:bg-violet-600/30 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-16 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] text-violet-300 text-xs font-medium mb-6 tracking-wide uppercase">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              Engineering Intelligence
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.1] tracking-tight animate-fade-in-up stagger-1">
            Your GitHub,{' '}
            <span className="bg-gradient-to-r from-violet-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              decoded
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
            Transform raw Git activity into actionable engineering intelligenceâ€”from PR bottlenecks to burnout signals.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in-up stagger-3">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-medium bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Start Analyzing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#demo"
              className="px-7 py-3.5 rounded-xl text-slate-300 font-medium border border-white/[0.1] hover:border-white/[0.2] hover:text-white transition-all duration-300"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Interactive Dashboard Preview */}
        <div id="demo" className="mt-16">
          <InteractiveHero />
        </div>

        {/* Trusted By Section */}
        <div className="mt-20">
          <TrustedBy />
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-5 mt-20 max-w-4xl mx-auto">
          {[
            {
              icon: TrendingUp,
              title: 'Track Metrics',
              desc: 'Cycle time, review velocity, and PR throughput â€” visualized beautifully.',
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
        <div className="mt-16 max-w-3xl mx-auto animate-fade-in-up stagger-6">
          <div className="glass-card p-8 grid grid-cols-3 gap-8 text-center border-t-2 border-t-violet-500/20">
            {[
              { icon: BarChart3, value: '7+', label: 'Key Metrics', color: 'text-violet-400' },
              { icon: Shield, value: 'AES-256', label: 'Encrypted Tokens', color: 'text-teal-400' },
              { icon: Zap, value: '<60s', label: 'Setup Time', color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-3xl font-bold text-white font-mono-num">{stat.value}</span>
                <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 max-w-3xl mx-auto animate-fade-in-up stagger-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">
            <span className="text-white">Three steps to </span>
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">clarity</span>
          </h2>
          <p className="text-center text-slate-400 text-sm mb-12">
            Most teams are shipping insights within the first hour
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {[
              { 
                num: '01', 
                title: 'Connect', 
                desc: 'Create a GitHub token with repo read access.',
                benefit: 'Your credentials stay secure with AES-256 encryption.',
                icon: Key,
                color: 'violet'
              },
              { 
                num: '02', 
                title: 'Sync', 
                desc: 'Meridian pulls your PRs, reviews, and commits.',
                benefit: 'Initial sync completes in under 60 seconds for most repos.',
                icon: RefreshCw,
                color: 'teal'
              },
              { 
                num: '03', 
                title: 'Discover', 
                desc: 'View metrics and intelligent recommendations.',
                benefit: 'AI-powered insights reveal patterns you didn\'t know existed.',
                icon: Sparkles,
                color: 'amber'
              },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="inline-flex flex-col items-center gap-3 mb-4 relative z-10">
                  <div className={`h-14 w-14 rounded-2xl border-2 ${
                    step.color === 'violet' 
                      ? 'border-violet-500/30 bg-violet-500/10' 
                      : step.color === 'teal'
                      ? 'border-teal-500/30 bg-teal-500/10'
                      : 'border-amber-500/30 bg-amber-500/10'
                  } flex items-center justify-center`}>
                    <step.icon className={`h-6 w-6 ${
                      step.color === 'violet'
                        ? 'text-violet-400'
                        : step.color === 'teal'
                        ? 'text-teal-400'
                        : 'text-amber-400'
                    }`} />
                  </div>
                  <span className="text-xs text-slate-500 font-mono font-medium">{step.num}</span>
                </div>
                <h4 className="text-white font-semibold mb-2 text-lg">{step.title}</h4>
                <p className="text-sm text-slate-400 mb-1.5">{step.desc}</p>
                <p className="text-xs text-slate-500">{step.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Simple, transparent <span className="text-violet-400">pricing</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>
          
          <PricingToggle onToggle={setIsAnnual} />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              name: 'Hobby',
              monthlyPrice: 0,
              desc: 'For personal projects',
              features: ['3 Repositories', '30-day History', 'Basic Metrics', 'Community Support'],
              cta: 'Start Free',
              highlight: false,
            },
            {
              name: 'Pro',
              monthlyPrice: 19,
              desc: 'For growing teams',
              features: ['Unlimited Repos', 'Unlimited History', 'Advanced Insights', 'Priority Support', 'AI Analysis', 'DORA Metrics'],
              cta: 'Start 14-Day Trial',
              highlight: true,
            },
            {
              name: 'Team',
              monthlyPrice: 49,
              desc: 'For organizations',
              features: ['Everything in Pro', 'SAML SSO', 'Audit Logs', 'Dedicated Success', 'SLA Guarantee', 'Custom Reports'],
              cta: 'Contact Sales',
              highlight: false,
            },
          ].map((tier) => {
            const price = calculatePrice(tier.monthlyPrice);
            const displayPrice = tier.monthlyPrice === 0 ? '$0' : formatPrice(price);
            const period = tier.monthlyPrice === 0 ? '' : isAnnual ? '/yr' : '/mo';
            
            return (
              <div
                key={tier.name}
                className={`glass-card p-8 flex flex-col relative ${
                  tier.highlight ? 'border-violet-500/50 bg-violet-500/[0.04]' : ''
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-500 text-white text-xs font-medium shadow-glow">
                    Most teams start here
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-white font-metric">{displayPrice}</span>
                  {period && <span className="text-slate-500 text-sm">{period}</span>}
                </div>
                {isAnnual && tier.monthlyPrice > 0 && (
                  <p className="text-xs text-emerald-400 mb-2">
                    ${tier.monthlyPrice}/mo billed annually
                  </p>
                )}
                <p className="text-sm text-slate-400 mb-6">{tier.desc}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className={`h-4 w-4 ${tier.highlight ? 'text-violet-400' : 'text-slate-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/setup"
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 text-center ${
                    tier.highlight
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-glow'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.05]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <FeatureComparison />
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Loved by <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">engineering teams</span>
          </h2>
          <p className="text-slate-400">
            See how teams are using Meridian to ship faster and reduce burnout.
          </p>
        </div>
        <TestimonialsCarousel />
      </section>

      {/* Security Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <SecurityBadge />
        </div>
      </section>

      {/* Documentation / Resources Section */}
      <section id="docs" className="relative z-10 container mx-auto px-6 py-24 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Built for <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">developers</span>
          </h2>
          <p className="text-slate-400">
            Everything you need to integrate, customize, and extend Meridian.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-6 group hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4 text-teal-400 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-400 transition-colors">
              Quick Start Guide
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Get up and running in less than 5 minutes. Connect your repo and see your first metrics.
            </p>
            <div className="flex items-center text-teal-400 text-sm font-medium">
              Read Guide <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div className="glass-card p-6 group hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400 group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-400 transition-colors">
              Security & Compliance
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Learn how we handle your data, encryption standards, and SOC2 compliance details.
            </p>
            <div className="flex items-center text-violet-400 text-sm font-medium">
              View Security <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Pricing</Link></li>
                <li><Link href="#docs" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">About</Link></li>
                <li><Link href="#blog" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Blog</Link></li>
                <li><Link href="#contact" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Social</h3>
              <ul className="space-y-2">
                <li><Link href="https://github.com" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">GitHub</Link></li>
                <li><Link href="https://twitter.com" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Twitter</Link></li>
                <li><Link href="https://linkedin.com" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-violet-400/50" />
              <p className="text-xs text-slate-500">
                Â© {new Date().getFullYear()} Meridian. Built with Next.js, Supabase & Prisma
              </p>
            </div>
            <p className="text-xs text-slate-500">All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
