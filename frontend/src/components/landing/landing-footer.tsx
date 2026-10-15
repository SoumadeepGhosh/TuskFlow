'use client';

import React from 'react';
import Link from 'next/link';
import { Kanban, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#090C15] text-slate-400 py-16 text-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-16 border-b border-white/[0.06]">
          {/* Brand info (2 cols) */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25">
                <Kanban className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Task<span className="text-indigo-400">Flow</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The high-velocity project management platform. Designed for fast-moving engineering teams, built on Next.js 16, NestJS, and Redis.
            </p>

            {/* Live Status indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • 99.99%</span>
            </div>
          </div>

          {/* Column: Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Kanban Boards
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Realtime Sockets
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-white transition-colors">
                  Sprint Planning
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Compare vs Jira
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
              Architecture
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-slate-300">Next.js 16 App Router</span>
              </li>
              <li>
                <span className="text-slate-300">NestJS 11 Microservices</span>
              </li>
              <li>
                <span className="text-slate-300">Prisma 7 + Neon Postgres</span>
              </li>
              <li>
                <span className="text-slate-300">BullMQ + Redis Queues</span>
              </li>
              <li>
                <span className="text-slate-300">Brevo Transactional API</span>
              </li>
            </ul>
          </div>

          {/* Column: Resources & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="https://github.com/SoumadeepGhosh/TuskFlow"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Documentation & FAQ
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} TaskFlow Inc. Built for high-velocity teams.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">
              Security Overview
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
