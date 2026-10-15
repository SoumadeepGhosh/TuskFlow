'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Play,
  CheckCircle2,
  Users,
  Clock,
  Layers,
  Zap,
  Activity,
  Flame,
  Search,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* 1. Eyebrow Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-inner"
        >
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">TaskFlow 2.0</span>
          <span className="text-white/40">•</span>
          <span className="text-slate-300">Engineered for high-velocity teams</span>
          <ArrowRight className="w-3 h-3 text-indigo-400" />
        </motion.div>

        {/* 2. Massive Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white max-w-5xl leading-[1.08]"
        >
          Manage Projects{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 animate-gradient">
            Faster Than Ever.
          </span>
        </motion.h1>

        {/* 3. Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl leading-relaxed font-normal"
        >
          TaskFlow unifies sub-50ms realtime sockets, Linear-fast Kanban boards, sprint
          planning, and automated background workflows in a distraction-free dark interface.
        </motion.p>

        {/* 4. Action CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 border border-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/register" className="flex items-center gap-2.5">
              <span>Start Free with GitHub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full sm:w-auto h-13 px-7 text-base font-medium rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 hover:text-white border-white/10 hover:border-white/20 backdrop-blur-md transition-all"
          >
            <a href="#showcase" className="flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
              <span>Explore Interactive Demo</span>
            </a>
          </Button>
        </motion.div>

        {/* 5. Trust micro-badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Free for up to 10 members
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Instant 2-minute setup
          </span>
        </motion.div>

        {/* 6. Hero Dashboard Preview with Floating Cards & Glow */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mt-16 sm:mt-20 w-full max-w-6xl mx-auto"
        >
          {/* Ambient Multi-Layer Radial Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-30 -z-10" />

          {/* Container Mockup */}
          <div className="relative rounded-2xl md:rounded-3xl border border-white/10 bg-[#0E1322]/90 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden text-left p-4 sm:p-6 md:p-8">
            {/* Top Mockup Window Controls */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                  TaskFlow • Engineering Sprint Cycle #14
                </span>
              </div>

              {/* Command Palette Mock Search */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-400">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search tasks, assignees, docs...</span>
                <span className="ml-4 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-300 font-mono">
                  ⌘K
                </span>
              </div>

              {/* Live socket connection status */}
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">Realtime Synced</span>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: IN PROGRESS */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>In Progress</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-slate-400">
                      3
                    </span>
                  </div>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>

                {/* Card 1 */}
                <div className="p-3.5 rounded-xl bg-[#13192B] border border-white/[0.08] hover:border-indigo-500/40 transition-all shadow-md group cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-indigo-400 font-medium">TF-104</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold text-[10px]">
                      P0 Urgent
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    Brevo Transactional Email HTTPS REST API
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Migrate SMTP port timeout to Brevo v3 HTTPS endpoint with retry backoff.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                        SG
                      </div>
                      <span>Soumadeep</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Today</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-3.5 rounded-xl bg-[#13192B] border border-white/[0.08] hover:border-indigo-500/40 transition-all shadow-md group cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-purple-400 font-medium">TF-108</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold text-[10px]">
                      High
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    Realtime Socket.IO Gateway Rooms
                  </h4>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] text-white font-bold">
                        AL
                      </div>
                      <span>Alex L.</span>
                    </div>
                    <span className="text-emerald-400 font-medium">95% done</span>
                  </div>
                </div>
              </div>

              {/* Column 2: IN CODE REVIEW */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>In Review</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-slate-400">
                      2
                    </span>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-3.5 rounded-xl bg-[#13192B] border border-white/[0.08] hover:border-purple-500/40 transition-all shadow-md group cursor-pointer">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-cyan-400 font-medium">TF-92</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold text-[10px]">
                      Normal
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Interactive Gantt & Sprint Calendar
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Multi-month view with drag re-schedule and dependency link paths.
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white font-bold">
                        EM
                      </div>
                      <span>Elena M.</span>
                    </div>
                    <span className="text-purple-400">PR #88 Ready</span>
                  </div>
                </div>
              </div>

              {/* Column 3: COMPLETED */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Completed</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[10px] text-slate-400">
                      14
                    </span>
                  </div>
                </div>

                {/* Card 4 */}
                <div className="p-3.5 rounded-xl bg-[#13192B]/80 border border-emerald-500/20 shadow-md group cursor-pointer opacity-90">
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="font-mono text-emerald-400 font-medium line-through">
                      TF-76
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px]">
                      Shipped
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Neon PostgreSQL Schema Migrations
                  </h4>
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-medium">Verified in Prod</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Live Notification Pill (Simulated Real-time socket event) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute bottom-6 right-6 p-3 rounded-2xl bg-[#111625]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-xl flex items-center gap-3 hidden sm:flex max-w-sm"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-white">Elena mentioned you</p>
                <p className="text-slate-400 line-clamp-1">
                  "Ready for review on #TF-104 @Soumadeep"
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-mono ml-auto">Just now</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

