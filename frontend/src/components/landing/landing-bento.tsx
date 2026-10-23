'use client';

import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    id: 'workspaces',
    tag: 'Workspaces & Projects',
    headline: 'One place for every team and every project.',
    description:
      'Create dedicated workspaces for each team. Inside each workspace, organize work into projects with their own boards, members, and permissions. Everything is scoped and searchable.',
    align: 'right',
    preview: <WorkspacePreview />,
  },
  {
    id: 'kanban',
    tag: 'Kanban & Sprint Planning',
    headline: 'Visual boards that match how your team thinks.',
    description:
      'Drag and drop tasks across customizable columns. Plan sprints, set due dates, assign members, and track progress at a glance. Built for both engineering and non-engineering teams.',
    align: 'left',
    preview: <SprintPreview />,
  },
  {
    id: 'realtime',
    tag: 'Real-time Collaboration',
    headline: 'Everyone stays in sync, automatically.',
    description:
      'Changes appear instantly for every team member. Comments, status updates, assignments, and activity are all live — powered by WebSocket connections with no polling.',
    align: 'right',
    preview: <ActivityPreview />,
  },
];

function WorkspacePreview() {
  const items = ['Design System', 'Backend API', 'Mobile App', 'Marketing Site'];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full max-w-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Workspaces</p>
      <div className="space-y-2">
        {items.map((name, i) => (
          <div
            key={name}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${i === 1 ? 'border-[#4F46E5]/30 bg-[#4F46E5]/5' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              ['bg-violet-100 text-violet-600','bg-[#4F46E5] text-white','bg-cyan-100 text-cyan-600','bg-emerald-100 text-emerald-600'][i]
            }`}>
              {name[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{name}</p>
              <p className="text-xs text-gray-400">{[3,8,5,2][i]} projects</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SprintPreview() {
  const tasks = [
    { name: 'Setup CI pipeline', done: true, assignee: 'SG' },
    { name: 'Design token audit', done: true, assignee: 'RK' },
    { name: 'Auth middleware', done: false, assignee: 'AP' },
    { name: 'Dashboard widgets', done: false, assignee: 'SG' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800">Sprint 12</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">Active</span>
      </div>
      <div className="space-y-2 mb-4">
        {tasks.map((t) => (
          <div key={t.name} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${t.done ? 'bg-[#22C55E]' : 'border-2 border-gray-200'}`}>
              {t.done && (
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <p className={`text-xs flex-1 ${t.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.name}</p>
            <div className="w-5 h-5 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[9px] font-bold text-[#4F46E5]">{t.assignee}</div>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-[#22C55E]" />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">2 of 4 completed</p>
    </div>
  );
}

function ActivityPreview() {
  const events = [
    { user: 'AP', action: 'moved "Auth middleware" to In Review', time: '2m ago', color: 'bg-blue-500' },
    { user: 'SG', action: 'commented on "Dashboard widgets"', time: '5m ago', color: 'bg-[#4F46E5]' },
    { user: 'RK', action: 'assigned "Token audit" to themselves', time: '12m ago', color: 'bg-violet-500' },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 w-full max-w-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Activity Feed</p>
      <div className="space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className={`w-7 h-7 rounded-full ${e.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5`}>
              {e.user}
            </div>
            <div>
              <p className="text-xs text-gray-700 leading-snug">{e.action}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{e.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-green-50 border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <p className="text-[11px] text-green-700 font-medium">3 teammates online</p>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function LandingBento() {
  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4F46E5] mb-3">Features</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Built for how modern teams work
        </h2>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">
          Every feature was designed around one question: does this help teams ship faster?
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="space-y-20"
      >
        {features.map((f) => (
          <motion.div
            key={f.id}
            variants={itemVariants}
            className={`flex flex-col ${f.align === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}
          >
            {/* Copy */}
            <div className="flex-1 max-w-lg">
              <span className="inline-block text-xs font-semibold text-[#4F46E5] bg-[#4F46E5]/8 px-3 py-1 rounded-full mb-4">
                {f.tag}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                {f.headline}
              </h3>
              <p className="mt-4 text-gray-500 leading-relaxed">{f.description}</p>
            </div>
            {/* Visual */}
            <div className="flex-1 flex justify-center">
              {f.preview}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
