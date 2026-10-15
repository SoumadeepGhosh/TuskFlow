'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      description: 'Ideal for small engineering squads and open source projects.',
      monthlyPrice: 0,
      annualPrice: 0,
      badge: 'Free Forever',
      popular: false,
      cta: 'Start Free Today',
      href: '/register',
      features: [
        'Up to 10 active team members',
        'Unlimited Kanban boards & columns',
        'Sub-50ms Socket.IO realtime sync',
        'Standard Brevo email notifications',
        '1 Workspace & 5 Projects',
        'Community Discord support',
      ],
    },
    {
      name: 'Pro',
      description: 'Engineered for scaling startups shipping high-velocity cycles.',
      monthlyPrice: 15,
      annualPrice: 12,
      badge: 'Most Popular',
      popular: true,
      cta: 'Upgrade to Pro',
      href: '/register',
      features: [
        'Unlimited team members & guests',
        'Unlimited Workspaces & Projects',
        'Sprint Planning & Burndown Velocity',
        'AI Subtask Generator & Summaries',
        'Dedicated BullMQ priority queue',
        'Granular Role-Based Permissions (RBAC)',
        'Milestone Calendar & Gantt timeline',
        'Priority email & Slack support',
      ],
    },
    {
      name: 'Enterprise',
      description: 'Custom governance, compliance, and dedicated infrastructure.',
      monthlyPrice: 45,
      annualPrice: 36,
      badge: 'Enterprise Grade',
      popular: false,
      cta: 'Contact Sales',
      href: '/register',
      features: [
        'Everything in Pro plan',
        'Custom Brevo sender domain & dedicated IP',
        'SAML 2.0 / Okta / Google SSO',
        'Full Audit Log streaming & retention',
        '99.99% Guaranteed Uptime SLA',
        'Custom Neon DB read replicas',
        'Dedicated Technical Account Manager',
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-28 md:py-36 border-t border-white/[0.06] bg-[#0B0F19]/60">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Simple, predictable pricing{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              for every stage.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Start free with up to 10 team members. Upgrade as your product velocity accelerates.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-10 inline-flex items-center gap-3 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !annual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                annual ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.name}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#13192B] to-[#0E1322] border-2 border-indigo-500/60 shadow-2xl shadow-indigo-500/20'
                    : 'bg-[#0F1424]/90 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold tracking-wide uppercase shadow-md shadow-indigo-500/30">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-5xl font-black text-white font-mono">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      / user / month
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-6 border-t border-white/[0.08] mb-8">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className={`w-full rounded-2xl h-12 text-sm font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10'
                  }`}
                >
                  <Link href={plan.href} className="flex items-center justify-center gap-2">
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

