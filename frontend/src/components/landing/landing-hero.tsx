'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

/* Minimal inline Kanban preview — no fake screenshots */
function KanbanPreview() {
  const columns = [
    {
      title: 'To Do',
      color: 'bg-gray-100 text-gray-600',
      dot: 'bg-gray-400',
      cards: [
        { title: 'Design system tokens', priority: 'Medium', tag: 'Design' },
        { title: 'API documentation', priority: 'Low', tag: 'Docs' },
      ],
    },
    {
      title: 'In Progress',
      color: 'bg-blue-50 text-blue-600',
      dot: 'bg-blue-500',
      cards: [
        { title: 'User auth flow', priority: 'High', tag: 'Backend' },
        { title: 'Dashboard layout', priority: 'High', tag: 'Frontend' },
      ],
    },
    {
      title: 'Done',
      color: 'bg-green-50 text-green-700',
      dot: 'bg-green-500',
      cards: [
        { title: 'Project scaffolding', priority: 'High', tag: 'Setup' },
        { title: 'CI pipeline', priority: 'Medium', tag: 'DevOps' },
      ],
    },
  ];

  const priorityColor: Record<string, string> = {
    High: 'text-red-500 bg-red-50',
    Medium: 'text-amber-600 bg-amber-50',
    Low: 'text-gray-500 bg-gray-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' as const }}
      className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-100/80 overflow-hidden"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-4 text-xs text-gray-400 font-medium">TaskFlow — Sprint 12</span>
      </div>

      {/* Board header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">Kanban Board</span>
        <div className="flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] font-medium">Sprint 12</span>
          <span className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-500">6 tasks</span>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-3 p-4 bg-gray-50/60 overflow-x-auto">
        {columns.map((col) => (
          <div key={col.title} className="flex-1 min-w-[160px]">
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-2 ${col.color} w-fit text-xs font-semibold`}>
              <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
              {col.title}
            </div>
            <div className="flex flex-col gap-2">
              {col.cards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-xl border border-gray-200/80 px-3 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                >
                  <p className="text-xs font-medium text-gray-800 leading-tight mb-2">{card.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#4F46E5]/10 text-[#4F46E5] font-medium">{card.tag}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${priorityColor[card.priority]}`}>
                      {card.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <section className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
        {/* Left copy */}
        <div className="flex-1 max-w-xl">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4F46E5]/20 bg-[#4F46E5]/5 text-[#4F46E5] mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
            Now with real-time collaboration
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-4xl md:text-5xl lg:text-[52px] font-bold text-gray-900 leading-[1.1] tracking-tight"
          >
            Project management
            <br />
            <span className="text-[#4F46E5]">that keeps your team</span>
            <br />
            moving.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-6 text-lg text-gray-500 leading-relaxed"
          >
            TaskFlow brings your workspaces, boards, and team together. Plan sprints, track tasks,
            and ship faster — without the overhead.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#4338CA] transition-all duration-200 shadow-sm shadow-[#4F46E5]/20 hover:shadow-md hover:shadow-[#4F46E5]/30 hover:-translate-y-0.5"
            >
              Get Started — it's free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 px-5 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="mt-8 flex items-center gap-5"
          >
            {[
              { label: 'No credit card required' },
              { label: 'Free to start' },
              { label: 'Open source' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#22C55E" strokeWidth="2">
                  <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — Kanban preview */}
        <div className="flex-1 flex justify-center lg:justify-end w-full">
          <KanbanPreview />
        </div>
      </div>
    </section>
  );
}
