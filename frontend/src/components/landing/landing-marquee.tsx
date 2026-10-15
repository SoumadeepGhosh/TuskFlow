'use client';

import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Vercel', logo: '▲ Vercel' },
  { name: 'Supabase', logo: '⚡ Supabase' },
  { name: 'Linear', logo: '◬ Linear' },
  { name: 'Raycast', logo: '✦ Raycast' },
  { name: 'Stripe', logo: '/// Stripe' },
  { name: 'Resend', logo: '✉ Resend' },
  { name: 'Retool', logo: '⚙ Retool' },
  { name: 'PlanetScale', logo: '⚿ PlanetScale' },
  { name: 'Prisma', logo: '▲ Prisma' },
  { name: 'Neon', logo: '✦ Neon DB' },
];

export function LandingMarquee() {
  return (
    <section className="relative py-12 border-y border-white/[0.06] bg-[#0B0F19]/60 overflow-hidden backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 font-mono">
          Empowering high-velocity engineering teams at modern tech leaders
        </p>
      </div>

      {/* Infinite Scrolling Track */}
      <div className="relative w-full flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="flex gap-16 shrink-0 items-center justify-around whitespace-nowrap"
        >
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand.name}-${i}`}
              className="flex items-center gap-2.5 text-lg font-bold text-slate-400 hover:text-white transition-colors duration-200 cursor-default font-mono tracking-tight"
            >
              <span className="text-xl opacity-80">{brand.logo}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

