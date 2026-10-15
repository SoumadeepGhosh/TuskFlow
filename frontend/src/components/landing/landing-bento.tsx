'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Kanban,
  Zap,
  ShieldCheck,
  Bell,
  LineChart,
  Command,
  Sparkles,
  Layers,
  ArrowUpRight,
  Workflow,
  Search,
} from 'lucide-react';

export function LandingBento() {
  return (
    <section id="features" className="relative py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Built for speed.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              Designed for precision.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Every screen, animation, and socket payload in TaskFlow is engineered to eliminate friction
            so your team spends less time updating status and more time shipping code.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Kanban Board (2 columns wide) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 relative p-8 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-indigo-500/40 shadow-xl overflow-hidden group"
          >
            {/* Ambient Background Gradient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all duration-500" />

            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Kanban className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.08]">
                Interactive DnD-Kit
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Fluid, High-Velocity Kanban Boards
            </h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-6">
              Move tasks with smooth physics, drag between columns, customize sprint workflows, and set WIP limits.
              Experience zero lag even with thousands of cards.
            </p>

            {/* Interactive Preview Widget */}
            <div className="p-4 rounded-2xl bg-[#0A0D18] border border-white/[0.06] grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <div className="text-[11px] font-semibold text-slate-300 mb-2">To Do</div>
                <div className="p-2 rounded-lg bg-white/[0.05] text-[11px] text-slate-200 font-medium border border-white/5">
                  Auth0 SSO Setup
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <div className="text-[11px] font-semibold text-indigo-400 mb-2">In Progress</div>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-[11px] text-indigo-300 font-medium border border-indigo-500/20">
                  Brevo HTTPS API
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                <div className="text-[11px] font-semibold text-emerald-400 mb-2">Done</div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-[11px] text-emerald-300 font-medium border border-emerald-500/20">
                  Prisma 7 Postgres
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Sub-50ms Sockets (1 column) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative p-8 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-cyan-500/40 shadow-xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/20 transition-all duration-500" />

            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                &lt; 50ms latency
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Sub-50ms Realtime Sockets
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Every assignee change, priority shift, and column move instantly syncs via Socket.IO rooms. No page refreshes required.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0A0D18] border border-white/[0.06] flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="text-xs">
                <div className="text-white font-medium">Socket.IO Room Connected</div>
                <div className="text-slate-500 font-mono text-[10px]">user:8 • room:workspace-14</div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Role-Based Access & Workspace Isolation (1 col) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative p-8 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-purple-500/40 shadow-xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-500" />

            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              Granular Role-Based Permissions
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Full workspace isolation with Owner, Admin, Member, and Viewer security scopes backed by encrypted JWT tokens.
            </p>

            <div className="space-y-2">
              {['Workspace Owner (Full Control)', 'Member (Create & Edit)', 'Viewer (Read-Only)'].map((role, idx) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300"
                >
                  <span>{role}</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: Asynchronous BullMQ & Brevo Email (2 cols) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-2 relative p-8 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-indigo-500/40 shadow-xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/20 transition-all duration-500" />

            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bell className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                BullMQ + Brevo v3 HTTPS
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              Asynchronous Background Workflows & Transactional Mail
            </h3>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-6">
              Emails, workspace invitations, and task assignments are offloaded to Redis BullMQ queues.
              API calls return in 10ms with zero SMTP port blocks or container timeouts.
            </p>

            {/* Micro visual: Pipeline */}
            <div className="p-4 rounded-2xl bg-[#0A0D18] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="text-white font-medium">Task Assigned Event</span>
              </div>
              <span className="text-slate-500">→</span>
              <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-mono text-[11px] border border-indigo-500/20">
                BullMQ Redis Queue
              </div>
              <span className="text-slate-500">→</span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Brevo REST API (HTTP 201)</span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Full Keyboard Command Palette (3 cols wide) */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="md:col-span-3 relative p-8 rounded-3xl bg-gradient-to-r from-[#0F1424] via-[#12182B] to-[#0F1424] border border-white/10 hover:border-purple-500/40 shadow-xl overflow-hidden group"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold mb-3">
                  <Command className="w-3.5 h-3.5" />
                  <span>LIGHTNING-FAST UX</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Keyboard-First Everything (Raycast & Linear Style)
                </h3>
                <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                  Never leave your keyboard. Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-xs">⌘K</kbd> to search tasks, assign teammates, switch workspaces, and toggle dark mode in milliseconds.
                </p>
              </div>

              {/* Shortcut pills */}
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono">
                  <span className="text-purple-400 font-bold">C</span> New Task
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono">
                  <span className="text-cyan-400 font-bold">M</span> Assign Me
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-mono">
                  <span className="text-indigo-400 font-bold">⌘/</span> Shortcuts
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

