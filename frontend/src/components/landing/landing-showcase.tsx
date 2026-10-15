'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Kanban,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  Plus,
} from 'lucide-react';

type TabKey = 'kanban' | 'analytics' | 'calendar' | 'activity';

export function LandingShowcase() {
  const [activeTab, setActiveTab] = useState<TabKey>('kanban');

  const tabs = [
    { key: 'kanban', label: 'Kanban Board', icon: Kanban },
    { key: 'analytics', label: 'Sprint Burndown', icon: BarChart3 },
    { key: 'calendar', label: 'Milestone Calendar', icon: Calendar },
    { key: 'activity', label: 'Live Audit Stream', icon: Activity },
  ];

  return (
    <section id="showcase" className="relative py-28 md:py-36 border-t border-white/[0.06] bg-[#0B0F19]/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERACTIVE PREVIEW</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            A single view for your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              entire product roadmap.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Toggle between live views to explore how TaskFlow adapts to engineering sprints, release management, and cross-functional milestones.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-white/20 scale-105'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Browser Mockup Wrapper */}
        <div className="relative rounded-3xl border border-white/10 bg-[#0F1424]/90 backdrop-blur-2xl shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8">
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/[0.06] text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="px-6 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono text-[11px] hidden sm:block">
              https://app.taskflow.dev/workspaces/acme-engineering/{activeTab}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-400">Socket Live</span>
            </div>
          </div>

          {/* Dynamic Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className="rounded-2xl bg-[#0A0D18] border border-white/[0.06] p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Ready For Dev (4)
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] text-indigo-400 font-mono font-medium">TF-110</div>
                    <div className="text-sm font-semibold text-white mt-1">Multi-Tenant Organization RBAC</div>
                    <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Assigned: Marcus K.</span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Feature</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] text-indigo-400 font-mono font-medium">TF-112</div>
                    <div className="text-sm font-semibold text-white mt-1">Redis BullMQ Rate-Limiter Tuning</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0A0D18] border border-white/[0.06] p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    In Progress (2)
                  </div>
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25">
                    <div className="text-[10px] text-indigo-300 font-mono font-medium">TF-104</div>
                    <div className="text-sm font-semibold text-white mt-1">Brevo REST API v3 Integration</div>
                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-semibold">Active Socket Connected</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">P0</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0A0D18] border border-white/[0.06] p-4 flex flex-col gap-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Completed (8)
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-300 font-mono font-medium">TF-98</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1 line-through">
                      Prisma Schema Auto-Sync Migrations
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-2xl bg-[#0A0D18] border border-white/[0.06] space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Sprint 14 Velocity & Burndown</h3>
                    <p className="text-xs text-slate-400">Story points completed vs. ideal velocity curve</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    +38% vs Previous Sprint
                  </span>
                </div>

                {/* Simulated SVG Graph */}
                <div className="relative h-48 w-full flex items-end justify-between gap-3 pt-6 border-b border-white/[0.08]">
                  {[45, 60, 55, 75, 90, 85, 110, 130].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-indigo-600 to-cyan-400 opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: `${(val / 140) * 100}%` }}
                      />
                      <span className="text-[10px] font-mono text-slate-500">Day {i + 1}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-2xl bg-[#0A0D18] border border-white/[0.06]"
              >
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                    <div key={d} className="font-semibold text-slate-400 pb-2">
                      {d}
                    </div>
                  ))}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className={`min-h-[70px] p-2 rounded-xl text-left border ${
                        i === 3
                          ? 'bg-indigo-500/10 border-indigo-500/30'
                          : i === 7
                            ? 'bg-purple-500/10 border-purple-500/30'
                            : 'bg-white/[0.02] border-white/[0.04]'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-slate-400">{i + 14}</span>
                      {i === 3 && (
                        <div className="mt-1 text-[10px] font-bold text-indigo-300 truncate">
                          🚀 v2.0 Launch
                        </div>
                      )}
                      {i === 7 && (
                        <div className="mt-1 text-[10px] font-bold text-purple-300 truncate">
                          Code Freeze
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-2xl bg-[#0A0D18] border border-white/[0.06] divide-y divide-white/[0.06] text-xs"
              >
                {[
                  {
                    user: 'Soumadeep Ghosh',
                    action: 'verified Brevo REST API v3 health check',
                    time: '2 minutes ago',
                    badge: 'API Verified',
                  },
                  {
                    user: 'Elena Rostova',
                    action: 'moved #TF-108 (Realtime Sockets) to Code Review',
                    time: '14 minutes ago',
                    badge: 'Task Moved',
                  },
                  {
                    user: 'Marcus Kim',
                    action: 'invited 3 engineers to Workspace "Acme Core"',
                    time: '1 hour ago',
                    badge: 'Team Invite',
                  },
                ].map((act, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-[10px]">
                        {act.user.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white">{act.user}</span>{' '}
                        <span className="text-slate-400">{act.action}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[10px] text-indigo-300 border border-white/5">
                        {act.badge}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{act.time}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

