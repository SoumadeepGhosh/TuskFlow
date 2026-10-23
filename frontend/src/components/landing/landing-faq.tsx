'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'Is TaskFlow free to use?',
    a: 'Yes. TaskFlow is open source and free to use. You can self-host it or use the hosted version. There are no hidden costs or credit card requirements to get started.',
  },
  {
    q: 'How does real-time collaboration work?',
    a: 'TaskFlow uses Socket.IO WebSocket connections. When any team member updates a task, moves a card, or adds a comment, all connected members see the change instantly — no page refresh required.',
  },
  {
    q: 'What are the available user roles?',
    a: 'TaskFlow supports four roles: Owner (full control), Admin (manage members and projects), Member (create and edit tasks), and Viewer (read-only access). Roles are scoped per workspace.',
  },
  {
    q: 'Can I use TaskFlow for multiple teams?',
    a: 'Absolutely. Each workspace is completely isolated. Create as many workspaces as you need, each with their own members, projects, and boards. Members in one workspace cannot see another unless invited.',
  },
  {
    q: 'How do I self-host TaskFlow?',
    a: 'TaskFlow ships with Docker configuration. Clone the repository, set your environment variables (PostgreSQL, Redis, JWT secret), and run docker-compose up. Full documentation is in the repository README.',
  },
  {
    q: 'What is the activity timeline?',
    a: 'Every action in a workspace — task creation, status changes, assignments, comments — is recorded in a chronological activity log. You can filter by project, member, or date range.',
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4F46E5] mb-3">FAQ</p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Common questions
        </h2>
      </motion.div>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
              <motion.div
                animate={{ rotate: open === i ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 text-gray-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
