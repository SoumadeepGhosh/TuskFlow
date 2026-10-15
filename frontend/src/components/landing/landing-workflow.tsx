'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Kanban,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  Rocket,
} from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Create Workspace & Invite Team',
    description:
      'Set up your organization workspace in 30 seconds. Send instant invitation links powered by Brevo REST API with zero SMTP timeout delays.',
    icon: UserPlus,
    badge: 'Instant Onboarding',
    accent: 'from-indigo-500 to-indigo-600',
  },
  {
    step: '02',
    title: 'Architect Sprints & Custom Columns',
    description:
      'Structure your Kanban board to match how your engineering team ships: Backlog, Ready for Dev, In Progress, Code Review, and Done.',
    icon: Kanban,
    badge: 'Flexible Workflow',
    accent: 'from-purple-500 to-purple-600',
  },
  {
    step: '03',
    title: 'Collaborate with Sub-50ms Sockets',
    description:
      'Assign tasks, leave markdown comments, attach documents, and receive real-time bell notifications without refreshing.',
    icon: Zap,
    badge: 'Zero Latency',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    step: '04',
    title: 'Track Velocity & Ship Releases',
    description:
      'Gain full visibility with burndown charts, calendar milestones, and activity timelines. Close out sprint cycles with confidence.',
    icon: Rocket,
    badge: '10x Productivity',
    accent: 'from-emerald-500 to-teal-600',
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="relative py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOW TASKFLOW WORKS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            From backlog to production{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300">
              in 4 simple steps.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            No complex setup scripts, no consultant certifications. Jump straight into shipping high-quality software.
          </p>
        </div>

        {/* Stepped Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative p-7 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-indigo-500/40 shadow-xl flex flex-col justify-between group transition-all"
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black font-mono text-white/20 group-hover:text-indigo-400/60 transition-colors">
                      {item.step}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.accent} flex items-center justify-center text-white shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <span className="inline-block text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.06] mb-3">
                    {item.badge}
                  </span>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

