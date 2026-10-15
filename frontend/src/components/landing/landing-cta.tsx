'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingCta() {
  return (
    <section className="relative py-28 md:py-36 overflow-hidden">
      {/* Aurora Ambient Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-[#0B0F19] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-[140px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-10 sm:p-16 rounded-3xl border border-white/10 bg-[#0F1424]/90 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inner grid */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START BUILDING TODAY</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Ready to 10x your team’s{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300">
              shipping velocity?
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join 10,000+ developers, designers, and engineering leaders who have eliminated task clutter and accelerated their sprint cycles with TaskFlow.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto h-13 px-8 text-base font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/30 border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Link href="/register" className="flex items-center gap-2">
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto h-13 px-7 text-base font-medium rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border-white/10 hover:border-white/20 backdrop-blur-md"
            >
              <Link href="/login">Sign in to your team</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Free for up to 10 members
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Full Socket.IO realtime access
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

