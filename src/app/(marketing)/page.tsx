'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'motion/react';
import { TrendingUp, Zap, Brain, ArrowRight, Activity, BarChart3, Shield, Key, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LogoMark } from '@/components/brand/LogoMark';
import { InteractiveHero } from '@/components/marketing/InteractiveHero';
import { PricingToggle } from '@/components/marketing/PricingToggle';
import { SecurityBadge } from '@/components/marketing/SecurityBadge';
import { useState } from 'react';
import { motionTokens } from '@/lib/motion-tokens';

const FeatureComparison = dynamic(() => import('@/components/marketing/FeatureComparison').then(m => ({ default: m.FeatureComparison })));
const TestimonialsCarousel = dynamic(() => import('@/components/marketing/TestimonialsCarousel').then(m => ({ default: m.TestimonialsCarousel })));
const TrustedBy = dynamic(() => import('@/components/marketing/TrustedBy').then(m => ({ default: m.TrustedBy })));
const LiquidMark = dynamic(() => import('@/components/brand/LiquidMark').then(m => ({ default: m.LiquidMark })), { ssr: false });

const fadeUp = {
  initial: { opacity: 0, y: motionTokens.distance.md },
  animate: { opacity: 1, y: 0 },
};

const revealUp = {
  initial: { opacity: 0, y: motionTokens.distance.md },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/[0.07] rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-foreground/[0.06]">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} className="text-primary" decorative />
            <span className="text-lg font-semibold text-foreground tracking-tight">Meridian</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="/setup" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/setup"
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground border border-primary/30 hover:border-primary/50 bg-primary/20 hover:bg-primary/30 transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-16 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="initial" animate="animate" variants={fadeUp} className="flex justify-center mb-6">
            <LiquidMark size={72} />
          </motion.div>

          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeUp}
            transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-xs font-medium mb-6 tracking-wide uppercase"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Engineering Intelligence
          </motion.div>

          <motion.h1
            initial="initial"
            animate="animate"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight"
          >
            Your GitHub,{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-emerald bg-clip-text text-transparent">
              decoded
            </span>
          </motion.h1>

          <motion.p
            initial="initial"
            animate="animate"
            variants={fadeUp}
            transition={{ delay: 0.15 }}
            className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            Transform raw Git activity into actionable engineering intelligence—from PR bottlenecks to burnout signals.
          </motion.p>

          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-primary-foreground font-medium bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-300 shadow-glow hover:shadow-glow-lg hover:scale-[1.02]"
            >
              Start Analyzing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="px-7 py-3.5 rounded-xl text-foreground/80 font-medium border border-foreground/[0.1] hover:border-foreground/[0.2] hover:text-foreground transition-all duration-300"
            >
              View Demo
            </Link>
          </motion.div>
        </div>

        {/* Interactive Dashboard Preview */}
        <div id="demo" className="mt-16">
          <InteractiveHero />
        </div>

        {/* Trusted By Section */}
        <motion.div {...revealUp} className="mt-20">
          <TrustedBy />
        </motion.div>

        {/* Features — asymmetric bento (1 featured + 2 stacked), not three equal cards */}
        <motion.div id="features" {...revealUp} className="grid md:grid-cols-12 gap-5 mt-20 max-w-4xl mx-auto">
          <div className="md:col-span-7 glass-card noise p-8 flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">Track Metrics</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                Cycle time, review velocity, and PR throughput — visualized beautifully, updated in real time.
              </p>
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="glass-card noise p-6 flex-1">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 bg-emerald/10 text-emerald">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Smart Insights</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pattern detection backed by real data. No noise, no hallucinations.
              </p>
            </div>
            <div className="glass-card noise p-6 flex-1">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 bg-amber/10 text-amber">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5 tracking-tight">Instant Setup</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paste your token, sync repos. Under 60 seconds to your first dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div {...revealUp} className="mt-16 max-w-3xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-3 gap-8 text-center border-t-2 border-t-primary/20">
            {[
              { icon: BarChart3, value: '7+', label: 'Key Metrics', color: 'text-primary' },
              { icon: Shield, value: 'AES-256', label: 'Encrypted Tokens', color: 'text-emerald' },
              { icon: Zap, value: '<60s', label: 'Setup Time', color: 'text-amber' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-3">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-3xl font-bold text-foreground font-mono-num">{stat.value}</span>
                <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How It Works — a real sequence, numbered markers are earned here */}
        <motion.div {...revealUp} className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">
            <span className="text-foreground">Three steps to </span>
            <span className="bg-gradient-to-r from-primary to-emerald bg-clip-text text-transparent">clarity</span>
          </h2>
          <p className="text-center text-muted-foreground text-sm mb-12">
            Most teams are shipping insights within the first hour
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            {[
              {
                num: '01',
                title: 'Connect',
                desc: 'Create a GitHub token with repo read access.',
                benefit: 'Your credentials stay secure with AES-256 encryption.',
                icon: Key,
                color: 'primary',
              },
              {
                num: '02',
                title: 'Sync',
                desc: 'Meridian pulls your PRs, reviews, and commits.',
                benefit: 'Initial sync completes in under 60 seconds for most repos.',
                icon: RefreshCw,
                color: 'emerald',
              },
              {
                num: '03',
                title: 'Discover',
                desc: 'View metrics and intelligent recommendations.',
                benefit: 'AI-powered insights reveal patterns you didn\'t know existed.',
                icon: Sparkles,
                color: 'amber',
              },
            ].map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="inline-flex flex-col items-center gap-3 mb-4 relative z-10">
                  <div
                    className={`h-14 w-14 rounded-2xl border-2 flex items-center justify-center ${
                      step.color === 'primary'
                        ? 'border-primary/30 bg-primary/10'
                        : step.color === 'emerald'
                        ? 'border-emerald/30 bg-emerald/10'
                        : 'border-amber/30 bg-amber/10'
                    }`}
                  >
                    <step.icon
                      className={`h-6 w-6 ${
                        step.color === 'primary' ? 'text-primary' : step.color === 'emerald' ? 'text-emerald' : 'text-amber'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono font-medium">{step.num}</span>
                </div>
                <h4 className="text-foreground font-semibold mb-2 text-lg">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-1.5">{step.desc}</p>
                <p className="text-xs text-muted-foreground/70">{step.benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 container mx-auto px-6 py-24">
        <motion.div {...revealUp} className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Simple, transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Start for free, upgrade when you need more power. No hidden fees.
          </p>

          <PricingToggle onToggle={setIsAnnual} />
        </motion.div>

        <motion.div {...revealUp} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                  tier.highlight ? 'border-primary/50 bg-primary/[0.04]' : ''
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-glow">
                    Most teams start here
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-foreground font-metric">{displayPrice}</span>
                  {period && <span className="text-muted-foreground text-sm">{period}</span>}
                </div>
                {isAnnual && tier.monthlyPrice > 0 && (
                  <p className="text-xs text-emerald mb-2">
                    ${tier.monthlyPrice}/mo billed annually
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-6">{tier.desc}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle className={`h-4 w-4 ${tier.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/setup"
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 text-center ${
                    tier.highlight
                      ? 'bg-primary hover:opacity-90 text-primary-foreground shadow-glow'
                      : 'bg-foreground/[0.05] hover:bg-foreground/[0.1] text-foreground border border-foreground/[0.05]'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </motion.div>

        {/* Feature Comparison Table */}
        <FeatureComparison />
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 border-t border-foreground/[0.06]">
        <motion.div {...revealUp} className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Loved by <span className="bg-gradient-to-r from-primary to-emerald bg-clip-text text-transparent">engineering teams</span>
          </h2>
          <p className="text-muted-foreground">
            See how teams are using Meridian to ship faster and reduce burnout.
          </p>
        </motion.div>
        <TestimonialsCarousel />
      </section>

      {/* Security Section */}
      <section className="relative z-10 container mx-auto px-6 py-24 border-t border-foreground/[0.06]">
        <motion.div {...revealUp} className="max-w-4xl mx-auto">
          <SecurityBadge />
        </motion.div>
      </section>

      {/* Documentation / Resources Section */}
      <section id="docs" className="relative z-10 container mx-auto px-6 py-24 border-t border-foreground/[0.06]">
        <motion.div {...revealUp} className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
            Built for <span className="bg-gradient-to-r from-emerald to-primary bg-clip-text text-transparent">developers</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to integrate, customize, and extend Meridian.
          </p>
        </motion.div>

        <motion.div {...revealUp} className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card p-6 group hover:bg-foreground/[0.02] transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-emerald/10 flex items-center justify-center mb-4 text-emerald group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-emerald transition-colors">
              Quick Start Guide
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get up and running in less than 5 minutes. Connect your repo and see your first metrics.
            </p>
            <div className="flex items-center text-emerald text-sm font-medium">
              Read Guide <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          <div className="glass-card p-6 group hover:bg-foreground/[0.02] transition-colors cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Security & Compliance
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn how we handle your data, encryption standards, and SOC2 compliance details.
            </p>
            <div className="flex items-center text-primary text-sm font-medium">
              View Security <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-foreground/[0.06] mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Pricing</Link></li>
                <li><Link href="#docs" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">About</Link></li>
                <li><Link href="#blog" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Blog</Link></li>
                <li><Link href="#contact" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#privacy" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#terms" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Social</h3>
              <ul className="space-y-2">
                <li><Link href="https://github.com" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">GitHub</Link></li>
                <li><Link href="https://twitter.com" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">Twitter</Link></li>
                <li><Link href="https://linkedin.com" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors">LinkedIn</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-foreground/[0.06] gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary/50" />
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Meridian. Built with Next.js, Supabase & Prisma
              </p>
            </div>
            <p className="text-xs text-muted-foreground">All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
