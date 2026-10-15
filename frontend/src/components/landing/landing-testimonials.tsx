'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'HyperScale AI',
    avatar: 'SC',
    avatarBg: 'from-indigo-500 to-purple-600',
    quote:
      'TaskFlow replaced both Jira and Slack notifications for our 45-person team. The sub-50ms Socket.IO realtime sync makes standups feel completely effortless.',
    stars: 5,
  },
  {
    name: 'David Miller',
    role: 'Staff Infrastructure Architect',
    company: 'CloudNative Labs',
    avatar: 'DM',
    avatarBg: 'from-purple-500 to-pink-600',
    quote:
      'The architecture under the hood is remarkably sound. Offloading emails to BullMQ and Brevo HTTPS completely solved our timeout issues on Railway containers.',
    stars: 5,
  },
  {
    name: 'Elena Rostova',
    role: 'Head of Product',
    company: 'FinPulse SaaS',
    avatar: 'ER',
    avatarBg: 'from-cyan-500 to-blue-600',
    quote:
      'The UI feels like a hybrid of Linear and Raycast. Our designers and engineers actually enjoy updating their cards because there is zero friction.',
    stars: 5,
  },
  {
    name: 'Marcus Thorne',
    role: 'Founder & CTO',
    company: 'NextGen Devs',
    avatar: 'MT',
    avatarBg: 'from-emerald-500 to-teal-600',
    quote:
      'We migrated 350+ tasks from Trello in under five minutes. The keyboard shortcuts (Cmd+K) alone save our team at least 4 hours every sprint cycle.',
    stars: 5,
  },
  {
    name: 'Jessica Vance',
    role: 'Engineering Director',
    company: 'Verve Systems',
    avatar: 'JV',
    avatarBg: 'from-amber-500 to-orange-600',
    quote:
      'The role-based workspace isolation and granular permissions give us enterprise-level security without having to negotiate a 6-figure enterprise contract.',
    stars: 5,
  },
  {
    name: 'Alex Rivera',
    role: 'Senior Fullstack Engineer',
    company: 'DataStream Core',
    avatar: 'AR',
    avatarBg: 'from-rose-500 to-red-600',
    quote:
      'The dark mode design is gorgeous. Everything runs at a smooth 60 FPS. TaskFlow is easily the best project management tool built in the last decade.',
    stars: 5,
  },
];

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="relative py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Loved by engineering teams{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              shipping at lightspeed.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            See why high-velocity teams choose TaskFlow as their primary daily driver.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -5 }}
              className="p-7 rounded-3xl bg-[#0F1424]/90 border border-white/10 hover:border-indigo-500/40 shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.avatarBg} flex items-center justify-center font-bold text-white text-xs shadow-md`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t.role} • <span className="text-slate-300 font-medium">{t.company}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

