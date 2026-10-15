'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle, Sparkles } from 'lucide-react';

const faqs = [
  {
    question: 'How fast is the realtime synchronization across teammates?',
    answer:
      'TaskFlow uses dedicated Socket.IO WebSocket rooms per workspace and user. State modifications (such as dragging a task card, changing priority, or assigning an engineer) dispatch and propagate to all active teammates in under 50 milliseconds without requiring browser refreshes.',
  },
  {
    question: 'How does TaskFlow handle transactional emails and team invitations?',
    answer:
      'Unlike legacy platforms that rely on SMTP connections (which are frequently blocked by cloud container firewalls on Railway/AWS), TaskFlow uses Brevo’s official v3 Transactional Email REST API over outbound HTTPS. All emails are queued asynchronously via BullMQ on Redis, ensuring zero API latency or timeout errors.',
  },
  {
    question: 'Can our team migrate from Jira, Trello, or Linear?',
    answer:
      'Yes. TaskFlow supports 1-click JSON and CSV imports from Jira, Trello, and Linear. Your boards, columns, assignees, labels, and due dates are preserved automatically.',
  },
  {
    question: 'Is the Starter Free plan really free forever?',
    answer:
      'Yes. The Starter plan is 100% free for up to 10 team members with unlimited Kanban boards, tasks, and realtime sockets. There are no credit card requirements and no hidden expiration dates.',
  },
  {
    question: 'How does workspace isolation and security work?',
    answer:
      'Every workspace in TaskFlow is strictly isolated. Access is guarded by cryptographically signed JWT tokens and Argon2/bcrypt password hashing. Role-Based Access Control (RBAC) allows you to define Workspace Owners, Admins, Members, and Viewers.',
  },
  {
    question: 'Can I self-host TaskFlow or deploy to Railway / Vercel?',
    answer:
      'Absolutely. TaskFlow is built on Next.js 16 (App Router), NestJS, PostgreSQL (Neon/Docker), and Redis. You can deploy both the frontend on Vercel and the backend on Railway in under 5 minutes.',
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-28 md:py-36">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>GOT QUESTIONS?</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Everything you need to know about TaskFlow’s architecture, pricing, and capabilities.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/10 bg-[#0F1424]/90 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 text-white hover:text-indigo-300 transition-colors"
                >
                  <span className="font-semibold text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-slate-300">
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/[0.04] pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

