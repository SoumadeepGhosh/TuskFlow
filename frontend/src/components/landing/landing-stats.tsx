'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Users, Globe2 } from 'lucide-react';

const stats = [
  {
    value: '50K+',
    label: 'Tasks Shipped',
    description: 'Tracked across sprint lifecycles',
    icon: CheckCircle2,
    color: 'text-indigo-400',
  },
  {
    value: '10K+',
    label: 'Sprints Completed',
    description: 'With zero blocked release pipelines',
    icon: Zap,
    color: 'text-cyan-400',
  },
  {
    value: '99.99%',
    label: 'Realtime Uptime',
    description: 'Socket.IO rooms on resilient Redis',
    icon: Globe2,
    color: 'text-purple-400',
  },
  {
    value: '250+',
    label: 'Engineering Teams',
    description: 'From seed-stage to enterprise',
    icon: Users,
    color: 'text-emerald-400',
  },
];

export function LandingStats() {
  return (
    <section className="relative py-20 border-y border-white/[0.06] bg-[#0A0D18]/90">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-slate-200 mt-1">{stat.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{stat.description}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

