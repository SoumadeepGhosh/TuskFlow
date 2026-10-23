'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const advantages = [
  {
    title: 'Workspace isolation',
    description:
      'Each workspace has its own members, roles, and projects. No permission bleed between teams.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Real-time, not just polling',
    description:
      'TaskFlow uses persistent WebSocket connections. Updates arrive the moment they happen — no page refresh needed.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Granular permissions',
    description:
      'Owner, Admin, Member, and Viewer roles give you precise control over who can see, edit, or manage anything.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 1 19.07 19.07" />
      </svg>
    ),
  },
  {
    title: 'No vendor lock-in',
    description:
      'Open source codebase. Self-host it, extend it, or use our hosted version. Your data stays yours.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
      </svg>
    ),
  },
];

const comparisons = [
  { aspect: 'Real-time updates', taskflow: true, typical: false },
  { aspect: 'Open source', taskflow: true, typical: false },
  { aspect: 'Workspace isolation', taskflow: true, typical: true },
  { aspect: 'Sprint planning built-in', taskflow: true, typical: false },
  { aspect: 'Granular role permissions', taskflow: true, typical: true },
  { aspect: 'Free to start', taskflow: true, typical: false },
  { aspect: 'Activity timeline', taskflow: true, typical: true },
  { aspect: 'WebSocket notifications', taskflow: true, typical: false },
];

export function LandingComparison() {
  const [activeTab, setActiveTab] = useState<'why' | 'compare'>('why');

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="why">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4F46E5] mb-3">Why TaskFlow</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Designed differently
        </h2>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Most project management tools are either too complex or too simple. TaskFlow hits the sweet spot.
        </p>
      </motion.div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
          {(['why', 'compare'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative text-sm px-5 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'why' ? 'Key Advantages' : 'Feature Comparison'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'why' ? (
          <motion.div
            key="why"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            {advantages.map((adv, i) => (
              <motion.div
                key={adv.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-2xl border border-gray-200 bg-white hover:border-[#4F46E5]/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center shrink-0">
                  {adv.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{adv.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{adv.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              <span>Feature</span>
              <span className="text-center text-[#4F46E5]">TaskFlow</span>
              <span className="text-center">Typical tools</span>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.aspect}
                className={`grid grid-cols-3 px-5 py-3.5 border-b border-gray-100 last:border-0 text-sm ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
              >
                <span className="text-gray-700">{row.aspect}</span>
                <span className="text-center">
                  {row.taskflow ? (
                    <svg className="inline w-4 h-4 text-[#22C55E]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="inline w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 8h8" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
                <span className="text-center">
                  {row.typical ? (
                    <svg className="inline w-4 h-4 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="inline w-4 h-4 text-gray-300" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 5l6 6M11 5l-6 6" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
