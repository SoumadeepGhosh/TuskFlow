'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Zap, Flame } from 'lucide-react';

const comparisons = [
  {
    feature: 'Realtime Sync & Collaboration',
    taskflow: '< 50ms Instant WebSocket Rooms',
    legacy: 'Manual Refresh or 15s Polling',
    taskflowBetter: true,
  },
  {
    feature: 'Page Load & Navigation Speed',
    taskflow: 'Sub-second Next.js 16 App Router',
    legacy: '3–8s Heavy Cluttered Bundles',
    taskflowBetter: true,
  },
  {
    feature: 'Notification & Email Pipeline',
    taskflow: 'BullMQ Queue + Brevo HTTPS (Zero Timeout)',
    legacy: 'Blocked SMTP Ports or Paid Add-ons',
    taskflowBetter: true,
  },
  {
    feature: 'Keyboard-First UX (Cmd+K)',
    taskflow: 'Full Raycast/Linear style shortcuts',
    legacy: 'Mouse-heavy click marathons',
    taskflowBetter: true,
  },
  {
    feature: 'Sprint & Kanban Simplicity',
    taskflow: 'Opinionated, distraction-free velocity',
    legacy: '400+ Configuration screens & plugins',
    taskflowBetter: true,
  },
  {
    feature: 'Dark Mode Aesthetic',
    taskflow: 'Handcrafted OLED Dark Theme (#0B0F19)',
    legacy: 'Patchy high-contrast invert themes',
    taskflowBetter: true,
  },
];

export function LandingComparison() {
  return (
    <section id="solutions" className="relative py-28 md:py-36 border-t border-white/[0.06] bg-[#0B0F19]/40">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>UNMATCHED PERFORMANCE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            TaskFlow vs.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-slate-300 to-slate-500">
              Legacy Project Tools
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            See how TaskFlow eliminates the latency, bloat, and endless configuration that slows down modern engineering teams.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0F1424]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 p-6 sm:p-8 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Capability
            </div>
            <div className="hidden md:flex items-center gap-2 text-base font-bold text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>TaskFlow</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[10px] text-indigo-300 border border-indigo-500/20">
                Next-Gen
              </span>
            </div>
            <div className="hidden md:block text-sm font-semibold text-slate-500">
              Traditional Project Management
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/[0.06]">
            {comparisons.map((item, idx) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="grid grid-cols-1 md:grid-cols-3 p-6 sm:p-7 hover:bg-white/[0.02] transition-colors items-center gap-4 md:gap-0"
              >
                {/* Feature Name */}
                <div className="font-semibold text-white text-sm sm:text-base">
                  {item.feature}
                </div>

                {/* TaskFlow Side */}
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-200">
                    {item.taskflow}
                  </span>
                </div>

                {/* Legacy Side */}
                <div className="flex items-center gap-3 md:pl-2">
                  <div className="w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <X className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <span className="text-sm text-slate-400">
                    {item.legacy}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

