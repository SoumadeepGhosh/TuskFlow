'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function LandingCta() {
  return (
    <section className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto text-center bg-white rounded-3xl border border-gray-200 shadow-sm px-8 py-16"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#4F46E5] flex items-center justify-center mx-auto mb-6">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Start managing your projects today.
        </h2>
        <p className="mt-4 text-gray-500 text-lg leading-relaxed">
          Create your workspace in seconds. No setup required. No credit card.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#4F46E5] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#4338CA] transition-all duration-200 hover:-translate-y-0.5 shadow-sm shadow-[#4F46E5]/20 hover:shadow-md hover:shadow-[#4F46E5]/30"
          >
            Get Started — it's free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href="https://github.com/SoumadeepGhosh/TuskFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 px-6 py-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}
