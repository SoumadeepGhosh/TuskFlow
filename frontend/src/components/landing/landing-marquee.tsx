'use client';

import React from 'react';
import { motion } from 'framer-motion';

const capabilities = [
  'Workspaces',
  'Kanban Boards',
  'Sprint Planning',
  'Task Management',
  'Team Collaboration',
  'Roles & Permissions',
  'Activity Timeline',
  'Real-time Updates',
  'Notifications',
  'Analytics',
];

export function LandingMarquee() {
  return (
    <section className="py-12 border-y border-gray-100 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 text-center mb-6">
          Everything your team needs
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {capabilities.map((cap) => (
            <span
              key={cap}
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-sm"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#22C55E" strokeWidth="2.5">
                <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cap}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
