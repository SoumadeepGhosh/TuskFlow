'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { toast } from 'sonner';
import CustomCursor from '@/components/ui/custom-cursor';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // State
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [activeView, setActiveView] = useState<'board' | 'list' | 'insights'>('board');
  const [copiedBranch, setCopiedBranch] = useState(false);

  // Book Page Scroll State
  const bookScrollRef = useRef<HTMLDivElement>(null);
  const [activeBookPage, setActiveBookPage] = useState(0);

  const scrollToBookPage = (pageIndex: number) => {
    if (bookScrollRef.current) {
      const pageHeight = bookScrollRef.current.clientHeight;
      bookScrollRef.current.scrollTo({
        top: pageIndex * pageHeight,
        behavior: 'smooth',
      });
      setActiveBookPage(pageIndex);
    }
  };

  const handleBookScroll = () => {
    if (bookScrollRef.current) {
      const { scrollTop, clientHeight } = bookScrollRef.current;
      const page = Math.round(scrollTop / clientHeight);
      if (page !== activeBookPage && page >= 0 && page < 4) {
        setActiveBookPage(page);
      }
    }
  };

  const handlePrevPage = () => {
    if (activeBookPage > 0) scrollToBookPage(activeBookPage - 1);
  };

  const handleNextPage = () => {
    if (activeBookPage < 3) scrollToBookPage(activeBookPage + 1);
  };

  // Auth redirect for authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/workspaces');
    }
  }, [isAuthenticated, isLoading, router]);

  const copyBranchCommand = () => {
    const cmd = 'git checkout -b sarah/fe-188-optimistic-ui';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedBranch(true);
      toast.success('Git branch command copied to clipboard!');
      setTimeout(() => setCopiedBranch(false), 2000);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased selection:bg-primary/10 selection:text-primary min-h-screen flex flex-col">
      <CustomCursor />
      {/* ─── HEADER ─── */}
      <header className="fixed top-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {/* Top Announcement Bar */}
        {showAnnouncement && (
          <div className="w-full bg-surface-container-low border-b border-outline-variant/20 transition-all" id="top-announcement-bar">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 h-9 flex items-center justify-between font-label-sm text-label-sm">
              <div className="flex items-center gap-space-xs text-on-surface-variant flex-wrap">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-code-xs text-code-xs font-semibold">
                  NEW
                </span>
                <span>TaskFlow 2.4 is live: Linear-grade sprint cycles &amp; automated triage</span>
                <a
                  className="text-primary hover:text-primary-container font-medium inline-flex items-center gap-0.5 transition-colors ml-1"
                  href="#features"
                >
                  <span>Learn more</span>
                  <span className="material-symbols-outlined text-[13px] leading-none">arrow_forward</span>
                </a>
              </div>
              <button
                aria-label="Dismiss announcement"
                className="text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1 rounded transition-colors inline-flex items-center justify-center cursor-pointer"
                onClick={() => setShowAnnouncement(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Navbar */}
        <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <Link className="flex items-center gap-space-sm group" href="/">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#4f46e5] flex items-center justify-center text-white shadow-xs">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h11M4 18h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-md text-headline-md tracking-tight font-bold text-on-surface group-hover:text-primary transition-colors">
                  TaskFlow
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-xs text-code-xs">
                  v2.4
                </span>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1 ml-4">
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#features"
              >
                Features
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#playbook"
              >
                Playbook
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#solutions"
              >
                Solutions
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#workflow"
              >
                Workflow
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#architecture"
              >
                Architecture
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm"
                href="#faq"
              >
                Docs
              </a>
              <a
                className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors font-body-sm text-body-sm inline-flex items-center gap-2"
                href="https://github.com/SoumadeepGhosh/TuskFlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>GitHub</span>
                <span className="px-1.5 py-0.5 rounded-full bg-surface-container-high font-code-xs text-code-xs text-on-surface-variant">
                  ★ 12.8k
                </span>
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-space-sm">
            <Link
              className="px-3.5 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              href="/login"
            >
              Sign in
            </Link>
            <Link
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary !text-white hover:bg-primary-container transition-all shadow-[0_2px_8px_-1px_rgba(15,23,42,0.08)] font-label-md text-label-md"
              href="/register"
            >
              <span className="font-medium !text-white">Get Started</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/20 !text-white font-code-xs text-code-xs tracking-wider">
                ⌘K
              </kbd>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="w-full pt-28 bg-background min-h-screen flex-1">
        <div className="flex flex-col w-full">
          {/* SECTION 1: HERO SECTION */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-8 pb-20 flex flex-col items-center">
            {/* Superbadge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/60 border border-outline-variant/30 text-on-surface-variant font-label-sm text-label-sm shadow-xs transition-all hover:bg-surface-container-high mb-8 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-medium text-on-surface">Engineered for high-velocity software teams</span>
              <span className="text-outline">/</span>
              <span className="font-code-xs text-code-xs text-primary font-medium tracking-tight">Cycles v2.4</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-center font-headline-xl text-headline-xl md:text-[56px] md:leading-[60px] tracking-[-0.035em] font-bold text-on-surface max-w-4xl text-balance">
              Project management that keeps your team moving.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-center font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-balance">
              TaskFlow eliminates overhead with synchronous sprint planning, keyboard-first triage, and distraction-free Kanban workflows built for modern engineering organizations.
            </p>

            {/* Action Row */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary !text-white hover:bg-primary-container transition-all shadow-[0_2px_12px_rgba(79,70,229,0.25)] font-label-md text-label-md font-semibold text-center"
                href="/register"
              >
                <span className="!text-white">Get Started for Free</span>
                <span className="material-symbols-outlined text-[18px] !text-white">arrow_forward</span>
              </Link>
              <a
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-low transition-all shadow-xs font-label-md text-label-md font-medium text-center"
                href="#demo-board"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">play_circle</span>
                <span>Live Interactive Demo</span>
              </a>
            </div>

            {/* Inline Reassurance */}
            <div className="mt-4 flex items-center justify-center gap-2 text-on-surface-variant font-body-sm text-body-sm flex-wrap">
              <span>Free for teams up to 10</span>
              <span className="text-outline-variant">•</span>
              <span>No credit card required</span>
              <span className="text-outline-variant">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-tertiary">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                <span>SOC2 Type II Certified</span>
              </span>
            </div>

            {/* Product Viewport Frame */}
            <div className="w-full mt-14 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_20px_50px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
              {/* Window Chrome Bar */}
              <div className="h-11 bg-surface-container-low px-4 flex items-center justify-between border-b border-outline-variant/30 select-none">
                <div className="flex items-center gap-2 w-32">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-container border border-outline-variant/30 font-code-xs text-code-xs text-on-surface-variant max-w-sm w-full justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[12px] text-outline">lock</span>
                  <span className="truncate">app.taskflow.dev/sprints/active-cycle-14</span>
                </div>
                <div className="flex items-center gap-2.5 justify-end w-32 font-code-xs text-code-xs text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    <span className="hidden md:inline font-mono">main: synced</span>
                  </div>
                </div>
              </div>

              {/* App Sub-Header / Tooling Bar */}
              <div className="p-4 bg-surface-container-lowest border-b border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
                    <span className="material-symbols-outlined text-primary text-[20px]">view_kanban</span>
                    <span>Cycle 14 — Core Platform</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-code-xs text-code-xs font-medium">
                    8 days left
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-secondary-fixed/30 text-secondary font-code-xs text-code-xs font-semibold">
                    Velocity: 42pts
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Active Team Presence */}
                  <div className="flex items-center -space-x-2 mr-2">
                    <div className="w-7 h-7 rounded-full bg-[#3525cd] text-white border-2 border-surface-container-lowest flex items-center justify-center font-code-xs text-code-xs font-semibold">
                      SC
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-surface-container-lowest flex items-center justify-center font-code-xs text-code-xs font-semibold text-primary">
                      AM
                    </div>
                    <div className="w-7 h-7 rounded-full bg-tertiary-container/10 border-2 border-surface-container-lowest flex items-center justify-center font-code-xs text-code-xs font-semibold text-tertiary">
                      KL
                    </div>
                    <span className="pl-3 font-code-xs text-code-xs text-outline font-medium">+4 active</span>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    <span>Filters</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-low border border-outline-variant/40 text-on-surface-variant font-code-xs text-code-xs">
                    <span className="material-symbols-outlined text-[14px] text-outline">search</span>
                    <span>Quick Jump</span>
                    <kbd className="px-1 py-0.2 rounded bg-surface-container-highest text-on-surface font-code-xs text-[10px]">
                      ⌘K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Kanban 4-Column Canvas */}
              <div className="p-6 bg-surface-container-low/50 overflow-x-auto min-w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[960px]">
                  {/* Column 1: Backlog */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-outline"></span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Backlog</span>
                        <span className="font-code-xs text-code-xs text-outline bg-surface-container px-1.5 py-0.5 rounded">18</span>
                      </div>
                      <button className="text-outline hover:text-on-surface p-0.5" type="button">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    {/* Task Card 1 */}
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-outline-variant hover:shadow-sm transition-all flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-outline font-mono">ENG-402</span>
                        <span className="px-1.5 py-0.5 rounded bg-error-container/40 text-error font-medium inline-flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">keyboard_double_arrow_up</span>
                          High
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Implement distributed lock manager for Redis cluster</p>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-surface-container font-code-xs text-code-xs text-on-surface-variant">Backend</span>
                          <span className="px-1.5 py-0.5 rounded bg-surface-container font-code-xs text-code-xs text-outline">5pts</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-code-xs text-[10px] font-bold">SC</div>
                      </div>
                    </div>

                    {/* Task Card 2 */}
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs hover:border-outline-variant transition-all flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-outline font-mono">DX-109</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">Medium</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Publish OpenAPI 3.1 definitions to public developer portal</p>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container font-code-xs text-code-xs text-on-surface-variant">Docs</span>
                        <div className="w-5 h-5 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-code-xs text-[10px] font-bold">JD</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">In Progress</span>
                        <span className="font-code-xs text-code-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">5</span>
                      </div>
                      <button className="text-outline hover:text-on-surface p-0.5" type="button">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    {/* Active Drag-styled Card */}
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border-2 border-primary/40 shadow-md flex flex-col gap-2.5 relative">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-primary font-mono font-semibold">FE-188</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-semibold">Urgent</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-semibold text-on-surface">Optimistic UI updates on Kanban drag reorder</p>
                      
                      {/* Subtasks Progress */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
                          <span>Subtasks</span>
                          <span>2/3 completed</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-primary rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <div className="flex items-center gap-2 text-outline font-code-xs text-code-xs">
                          <span className="inline-flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">mode_comment</span> 3
                          </span>
                          <span className="inline-flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">attach_file</span> 1
                          </span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-primary !text-white flex items-center justify-center font-code-xs text-[10px] font-bold">AM</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-outline font-mono">SEC-81</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Low</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Rotate root KMS secrets in us-east-1 staging realm</p>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container font-code-xs text-code-xs text-on-surface-variant">Infra</span>
                        <div className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-code-xs text-[10px] font-bold">RK</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: In Review */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">In Review</span>
                        <span className="font-code-xs text-code-xs text-outline bg-surface-container px-1.5 py-0.5 rounded">3</span>
                      </div>
                      <button className="text-outline hover:text-on-surface p-0.5" type="button">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>

                    {/* Task Card with PR */}
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-outline font-mono">API-92</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-medium">Core</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Webhook signature verification middleware</p>
                      
                      {/* Linked PR badge */}
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#F0FDF4] border border-[#BBF7D0] text-[#15803D] font-code-xs text-code-xs w-fit">
                        <span className="material-symbols-outlined text-[13px]">alt_route</span>
                        <span>PR #342 • All checks pass</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                        <span className="text-outline font-code-xs text-code-xs">Reviewer: Alex M.</span>
                        <div className="w-5 h-5 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-code-xs text-[10px] font-bold">SC</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 4: Done */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                        <span className="font-label-md text-label-md text-on-surface font-semibold">Done</span>
                        <span className="font-code-xs text-code-xs text-tertiary bg-tertiary-container/10 px-1.5 py-0.5 rounded font-semibold">24</span>
                      </div>
                      <button className="text-outline hover:text-on-surface p-0.5" type="button">
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                    </div>

                    {/* Completed Card */}
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xs opacity-80 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between font-code-xs text-code-xs">
                        <span className="text-outline font-mono line-through">INFRA-104</span>
                        <span className="material-symbols-outlined text-tertiary text-[16px]">check_circle</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-through">Zero-downtime PostgreSQL 16 migration</p>
                      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 font-code-xs text-code-xs text-outline">
                        <span>Completed 2h ago</span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">8pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: LIVE METRICS & KEYBOARD CONTROL */}
          <section className="w-full bg-surface-container-low border-y border-outline-variant/30 py-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full md:w-auto text-left">
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface font-mono">12ms</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Interaction latency</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface font-mono">100%</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Offline-first sync</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface font-mono">0</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">State sync conflicts</span>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 text-on-surface-variant font-code-xs text-code-xs bg-surface-container-lowest px-4 py-2.5 rounded-xl border border-outline-variant/30 shadow-xs">
                <span className="text-on-surface font-semibold mr-1">Power Shortcuts:</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface">C</kbd> Create
                </span>
                <span className="text-outline">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface">J</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface">K</kbd> Navigate
                </span>
                <span className="text-outline">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface">M</kbd> Assign self
                </span>
                <span className="text-outline">•</span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/40 font-mono text-on-surface">Space</kbd> Preview
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 3: KEY FEATURES (ALTERNATING REAL MICRO-UIS) */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-28" id="features">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-3">
              <span className="font-code-xs text-code-xs text-primary font-semibold tracking-wider uppercase">Engineered for Production</span>
              <h2 className="font-headline-xl text-headline-xl tracking-[-0.03em] font-bold text-on-surface">
                Built around the way modern engineers actually build.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                No cumbersome forms. No Jira lag. Just clean, frictionless primitives designed for software craftsmanship.
              </p>
            </div>

            {/* Feature 1: Sprint & Cycle Rhythm */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary/10 text-primary font-code-xs text-code-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Cycle Automation</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Cycles, not just endless backlogs.
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Break out of infinite backlog purgatory. Set recurring 2-week sprint rhythms where incomplete scope automatically triages into the next cycle or returns gracefully to unprioritized queue.
                </p>
                <ul className="space-y-3 font-body-sm text-body-sm text-on-surface">
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Real-time scope burndown &amp; velocity forecasting</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Zero-configuration rollover at sprint cut-off</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    <span>Historic health metrics &amp; delivery accuracy tracking</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">Sprint Velocity &amp; Burnup</span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-container/10 text-tertiary font-code-xs text-code-xs font-semibold">On Track</span>
                  </div>
                  <span className="font-code-xs text-code-xs text-on-surface-variant font-mono">Cycle 14 (Day 6 of 14)</span>
                </div>

                {/* Inline SVG Burnup / Burndown Chart */}
                <div className="w-full h-52 relative">
                  <svg className="w-full h-full stroke-primary" fill="none" viewBox="0 0 500 200">
                    <line stroke="#E2E8F0" strokeDasharray="4" strokeWidth="1" x1="0" x2="500" y1="40" y2="40"></line>
                    <line stroke="#E2E8F0" strokeDasharray="4" strokeWidth="1" x1="0" x2="500" y1="90" y2="90"></line>
                    <line stroke="#E2E8F0" strokeDasharray="4" strokeWidth="1" x1="0" x2="500" y1="140" y2="140"></line>
                    <line stroke="#E2E8F0" strokeWidth="1" x1="0" x2="500" y1="190" y2="190"></line>
                    <line stroke="#94A3B8" strokeDasharray="6" strokeWidth="1.5" x1="20" x2="480" y1="180" y2="30"></line>
                    <path d="M 20 180 L 80 160 L 160 135 L 240 100 L 320 60 L 340 55" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                    <circle className="fill-primary stroke-surface-container-lowest stroke-2" cx="340" cy="55" r="5"></circle>
                    <path d="M 340 55 L 420 38 L 480 25" opacity="0.6" stroke="#4F46E5" strokeDasharray="3" strokeWidth="2"></path>
                  </svg>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant/20 mt-4 text-center">
                  <div className="p-2 rounded-lg bg-surface-container-low">
                    <span className="block font-code-xs text-code-xs text-outline">Target Scope</span>
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">54 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low">
                    <span className="block font-code-xs text-code-xs text-outline">Completed</span>
                    <span className="font-headline-sm text-headline-sm font-semibold text-tertiary">38 pts</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-low">
                    <span className="block font-code-xs text-code-xs text-outline">Projected Drift</span>
                    <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">+1 day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Keyboard-First Command Palette */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
                {/* Floating Command Dialog Mockup */}
                <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-lg overflow-hidden max-w-lg mx-auto">
                  <div className="p-3 border-b border-outline-variant/30 flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">search</span>
                    <span className="font-body-md text-body-md text-on-surface">assign to Sarah...</span>
                    <span className="ml-auto font-code-xs text-code-xs text-outline bg-surface-container px-1.5 py-0.5 rounded">Esc</span>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="p-2 rounded-lg bg-surface-container-high flex items-center justify-between text-on-surface cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-code-xs text-[10px] font-bold">SC</div>
                        <span className="font-label-md text-label-md font-medium">Sarah Chen (sarah@taskflow.dev)</span>
                      </div>
                      <span className="font-code-xs text-code-xs text-outline">Lead Eng</span>
                    </div>
                    <div className="p-2 rounded-lg hover:bg-surface-container flex items-center justify-between text-on-surface-variant cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center font-code-xs text-[10px] font-bold">AK</div>
                        <span className="font-label-md text-label-md">Alex Kim (alex@taskflow.dev)</span>
                      </div>
                      <span className="font-code-xs text-code-xs text-outline">Product</span>
                    </div>
                    <div className="p-2 rounded-lg hover:bg-surface-container flex items-center justify-between text-on-surface-variant cursor-pointer transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-code-xs text-[10px] font-bold">MR</div>
                        <span className="font-label-md text-label-md">Marcus Reed (marcus@taskflow.dev)</span>
                      </div>
                      <span className="font-code-xs text-code-xs text-outline">DevOps</span>
                    </div>
                  </div>
                  <div className="p-2 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between font-code-xs text-code-xs text-outline">
                    <div className="flex items-center gap-2">
                      <span>Navigate <kbd className="px-1 rounded bg-surface-container-high">↑↓</kbd></span>
                      <span>Select <kbd className="px-1 rounded bg-surface-container-high">↵</kbd></span>
                    </div>
                    <span>Change status with <kbd className="px-1 rounded bg-surface-container-high">S</kbd></span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-secondary/10 text-secondary font-code-xs text-code-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">keyboard</span>
                  <span>Zero Mouse Friction</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Navigate at the speed of thought.
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Every critical action is tied to a keystroke. Reassign engineers, cycle sprint milestones, tag labels, and link pull requests in milliseconds without ever touching your mouse.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface">Command Bar</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-code-xs">⌘K</kbd>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface">Assign Label</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-code-xs">L</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Automated Git & CI/CD Linkage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-tertiary-container/10 text-tertiary font-code-xs text-code-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">commit</span>
                  <span>Bi-directional Git Sync</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Automated state changes from your pull requests.
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Branch names link automatically. When a PR is opened, the task shifts to 'In Review'. When GitHub Actions pass and the merge lands, TaskFlow closes the card and flags the release notes.
                </p>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <span className="font-code-xs text-code-xs text-outline uppercase font-mono">Suggested Git Branch</span>
                  <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 font-mono text-code-xs text-on-surface">
                    <code>git checkout -b sarah/fe-188-optimistic-ui</code>
                    <button
                      className="text-primary hover:text-primary-container p-1 cursor-pointer transition-colors"
                      onClick={copyBranchCommand}
                      title="Copy branch command"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copiedBranch ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-on-surface">merge_type</span>
                      <span className="font-label-md text-label-md font-semibold text-on-surface">github.com/taskflow/core #419</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-code-xs text-code-xs font-semibold">Checks Passing</span>
                  </div>
                  <div className="space-y-2.5 font-code-xs text-code-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#15803D] text-[16px]">check</span>
                        <span className="text-on-surface font-mono">test:e2e-matrix (Playwright)</span>
                      </div>
                      <span className="text-outline">48s</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#15803D] text-[16px]">check</span>
                        <span className="text-on-surface font-mono">build:docker-artifact (linux/amd64)</span>
                      </div>
                      <span className="text-outline">1m 12s</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#15803D] text-[16px]">check</span>
                        <span className="text-on-surface font-mono">security:snyk-vulnerability-scan</span>
                      </div>
                      <span className="text-outline">14s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: THE ENGINEERING PLAYBOOK (BOOK-PAGE STICKY SCROLL) */}
          <section className="w-full bg-gradient-to-b from-surface via-surface-container-low/40 to-surface py-24 border-t border-outline-variant/20 relative" id="playbook">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                
                {/* STICKY MAIN SECTION (Left Column) */}
                <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-code-xs text-code-xs font-semibold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-sm">auto_stories</span>
                      <span>The Engineering Playbook</span>
                    </div>
                    <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                      A field manual for teams that ship continuously.
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                      This main section stays pinned while the book pages on the right scroll independently—without a scrollbar. Read through our four engineering tenets.
                    </p>
                  </div>

                  {/* Chapter Table of Contents */}
                  <div className="space-y-2 pt-2">
                    <span className="font-code-xs text-code-xs uppercase tracking-wider text-outline font-semibold">Chapters in this volume</span>
                    
                    {[
                      { num: '01', title: 'Workspaces & Tenancy Isolation', desc: 'Enterprise domains & multi-workspace RBAC' },
                      { num: '02', title: 'Sprint Cadence & Velocity Poker', desc: 'Predictable 2-week cycles without burnout' },
                      { num: '03', title: 'Real-Time Kanban & WebSocket Sync', desc: 'Sub-20ms multi-peer collaborative boards' },
                      { num: '04', title: 'Delivery Analytics & Burndown Curves', desc: 'Continuous metrics, cycle time & PR linkage' },
                    ].map((chapter, idx) => (
                      <button
                        key={chapter.num}
                        onClick={() => scrollToBookPage(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          activeBookPage === idx
                            ? 'bg-surface-container-lowest border-primary/40 shadow-sm text-on-surface ring-1 ring-primary/20'
                            : 'bg-surface-container-lowest/60 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-code-xs font-bold px-2 py-0.5 rounded ${
                            activeBookPage === idx ? 'bg-primary !text-white' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {chapter.num}
                          </span>
                          <div>
                            <div className="font-headline-sm text-sm font-semibold">{chapter.title}</div>
                            <div className="font-body-sm text-xs text-on-surface-variant opacity-80">{chapter.desc}</div>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-sm text-outline">
                          {activeBookPage === idx ? 'menu_book' : 'chevron_right'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Reading Progress Bar & Quick Flip Controls */}
                  <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 rounded-full bg-surface-container overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 rounded-full"
                          style={{ width: `${((activeBookPage + 1) / 4) * 100}%` }}
                        />
                      </div>
                      <span className="font-code-xs text-code-xs text-on-surface-variant">
                        Page {activeBookPage + 1} of 4
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrevPage}
                        disabled={activeBookPage === 0}
                        className="p-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Previous Page"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                      </button>
                      <button
                        onClick={handleNextPage}
                        disabled={activeBookPage === 3}
                        className="p-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        aria-label="Next Page"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* BOOK CONTAINER WITH NO-SCROLLBAR SCROLLING PAGES (Right Column) */}
                <div className="lg:col-span-7">
                  <div className="relative rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.12)] overflow-hidden">
                    
                    {/* Top Book Folio Header */}
                    <div className="h-12 px-6 bg-surface-container-low/80 border-b border-outline-variant/30 flex items-center justify-between relative">
                      {/* Decorative Ribbon Bookmark */}
                      <div className="absolute top-0 right-14 w-5 h-8 bg-primary rounded-b shadow-sm flex items-end justify-center pb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/60"></div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <span className="font-code-xs text-code-xs tracking-wider uppercase font-semibold text-on-surface-variant">
                          TASKFLOW MANUAL // VOL. 2.4
                        </span>
                      </div>

                      <div className="flex items-center gap-3 pr-8">
                        <span className="font-code-xs text-code-xs text-outline hidden sm:inline">
                          Scroll inside • No scrollbar
                        </span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-xs text-code-xs font-semibold">
                          PAGE {activeBookPage + 1}/04
                        </span>
                      </div>
                    </div>

                    {/* Book Pages Scroll Area (Without Scrollbar) */}
                    <div
                      ref={bookScrollRef}
                      onScroll={handleBookScroll}
                      className="h-[520px] overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory divide-y divide-dashed divide-outline-variant/30 bg-surface-container-lowest relative"
                    >
                      {/* PAGE 1: WORKSPACE & TENANCY */}
                      <div className="snap-start min-h-[520px] p-6 lg:p-8 flex flex-col justify-between relative bg-surface-container-lowest">
                        <div className="absolute top-6 right-8 font-mono text-7xl font-black text-slate-100 select-none pointer-events-none">
                          01
                        </div>
                        <div className="space-y-5 relative z-10 border-l-2 border-l-primary/40 pl-5">
                          <div className="space-y-1">
                            <span className="font-code-xs text-code-xs text-primary font-bold uppercase tracking-wider">
                              Chapter 01 • Architecture
                            </span>
                            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                              Multi-Tenant Workspaces &amp; RBAC Isolation
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant italic">
                              &ldquo;Clean architectural boundaries eliminate cross-tenant data leaks and allow engineering pods to operate independently.&rdquo;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-primary">domain</span>
                                Organization Hierarchy
                              </span>
                              <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                                ACTIVE RLS
                              </span>
                            </div>
                            <div className="space-y-1.5 font-code-xs text-code-xs text-on-surface-variant">
                              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                                <span>Acme Corp / Engineering Core</span>
                                <span className="text-primary font-medium">Owner (You)</span>
                              </div>
                              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                                <span>Acme Corp / Mobile Platform</span>
                                <span className="text-outline">Admin (4 Members)</span>
                              </div>
                            </div>
                          </div>

                          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                              <span>PostgreSQL Row-Level Security ensuring strict multi-tenant boundary separation.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                              <span>Signed HMAC invite tokens with 48h TTL dispatched via verified transactional mail.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="font-code-xs text-code-xs text-outline">TaskFlow Specification § 1.1</span>
                          <button
                            onClick={() => scrollToBookPage(1)}
                            className="font-medium text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
                          >
                            <span>Turn to Chapter 02</span>
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>
                      </div>

                      {/* PAGE 2: SPRINT CADENCE & PLANNING */}
                      <div className="snap-start min-h-[520px] p-6 lg:p-8 flex flex-col justify-between relative bg-surface-container-lowest">
                        <div className="absolute top-6 right-8 font-mono text-7xl font-black text-slate-100 select-none pointer-events-none">
                          02
                        </div>
                        <div className="space-y-5 relative z-10 border-l-2 border-l-secondary/40 pl-5">
                          <div className="space-y-1">
                            <span className="font-code-xs text-code-xs text-secondary font-bold uppercase tracking-wider">
                              Chapter 02 • Execution
                            </span>
                            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                              Predictable Sprints &amp; Story Point Poker
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant italic">
                              &ldquo;When velocity is measured accurately, estimation shifts from gut feeling to mathematical certainty.&rdquo;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-secondary">timer</span>
                                Sprint 42 • &ldquo;Hydra Engine&rdquo;
                              </span>
                              <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-bold">
                                8 DAYS LEFT
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                                <div className="font-mono font-bold text-sm text-on-surface">54 pts</div>
                                <div className="text-[10px] text-outline uppercase">Committed</div>
                              </div>
                              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                                <div className="font-mono font-bold text-sm text-tertiary">38 pts</div>
                                <div className="text-[10px] text-outline uppercase">Completed</div>
                              </div>
                              <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                                <div className="font-mono font-bold text-sm text-secondary">88%</div>
                                <div className="text-[10px] text-outline uppercase">Velocity</div>
                              </div>
                            </div>
                          </div>

                          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-secondary mt-0.5">check_circle</span>
                              <span>Fibonacci async poker estimation directly synced into your project backlog.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-secondary mt-0.5">check_circle</span>
                              <span>Automated roll-over triaging for tasks that exceed sprint timeboxes.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="font-code-xs text-code-xs text-outline">TaskFlow Specification § 2.4</span>
                          <button
                            onClick={() => scrollToBookPage(2)}
                            className="font-medium text-secondary hover:text-on-secondary-container flex items-center gap-1 transition-colors"
                          >
                            <span>Turn to Chapter 03</span>
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>
                      </div>

                      {/* PAGE 3: REAL-TIME COLLABORATIVE KANBAN */}
                      <div className="snap-start min-h-[520px] p-6 lg:p-8 flex flex-col justify-between relative bg-surface-container-lowest">
                        <div className="absolute top-6 right-8 font-mono text-7xl font-black text-slate-100 select-none pointer-events-none">
                          03
                        </div>
                        <div className="space-y-5 relative z-10 border-l-2 border-l-primary/40 pl-5">
                          <div className="space-y-1">
                            <span className="font-code-xs text-code-xs text-primary font-bold uppercase tracking-wider">
                              Chapter 03 • Collaboration
                            </span>
                            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                              Real-Time Board Engine &amp; WebSockets
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant italic">
                              &ldquo;Multiplayer state synchronization guarantees that every drag, drop, and edit reflects on teammates&apos; screens in under 20ms.&rdquo;
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-950 text-slate-200 font-code-xs text-code-xs space-y-2 border border-slate-800">
                            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                WebSocket Telemetry
                              </span>
                              <span>room:board-88</span>
                            </div>
                            <div className="space-y-1">
                              <div className="text-emerald-400">&gt; client.emit(&apos;task:reorder&apos;, &#123; id: 188, to: &apos;in_review&apos; &#125;)</div>
                              <div className="text-slate-400">&gt; ack: true • round-trip: 14ms • BullMQ job queued</div>
                              <div className="text-sky-300">&gt; broadcast: 6 peer clients updated optimistically</div>
                            </div>
                          </div>

                          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                              <span>Presence beacons show exactly who is editing or viewing each task card.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-primary mt-0.5">check_circle</span>
                              <span>Optimistic local mutations with instant background rollback if server emits reject.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="font-code-xs text-code-xs text-outline">TaskFlow Specification § 3.2</span>
                          <button
                            onClick={() => scrollToBookPage(3)}
                            className="font-medium text-primary hover:text-primary-container flex items-center gap-1 transition-colors"
                          >
                            <span>Turn to Chapter 04</span>
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </button>
                        </div>
                      </div>

                      {/* PAGE 4: DELIVERY ANALYTICS & BURNDOWN */}
                      <div className="snap-start min-h-[520px] p-6 lg:p-8 flex flex-col justify-between relative bg-surface-container-lowest">
                        <div className="absolute top-6 right-8 font-mono text-7xl font-black text-slate-100 select-none pointer-events-none">
                          04
                        </div>
                        <div className="space-y-5 relative z-10 border-l-2 border-l-tertiary/40 pl-5">
                          <div className="space-y-1">
                            <span className="font-code-xs text-code-xs text-tertiary font-bold uppercase tracking-wider">
                              Chapter 04 • Measurement
                            </span>
                            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                              Automated Burndown &amp; Cycle Time Insights
                            </h3>
                            <p className="font-body-md text-body-md text-on-surface-variant italic">
                              &ldquo;Actionable metrics derived from git commits, pull request lifecycles, and completed story points.&rdquo;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                            <div className="flex items-center justify-between text-xs font-semibold text-on-surface">
                              <span className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-tertiary">trending_up</span>
                                Cycle Time Trend
                              </span>
                              <span className="font-code-xs text-code-xs text-tertiary font-bold">
                                -34% FASTER
                              </span>
                            </div>
                            
                            {/* SVG Mini Chart */}
                            <svg className="w-full h-16 overflow-visible" viewBox="0 0 300 60">
                              <path
                                d="M 0 50 L 50 42 L 100 45 L 150 30 L 200 24 L 250 16 L 300 8"
                                fill="none"
                                stroke="#007030"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                              <path
                                d="M 0 50 L 300 10"
                                fill="none"
                                stroke="#c7c4d8"
                                strokeDasharray="3 3"
                                strokeWidth="1.5"
                              />
                            </svg>
                            <div className="flex justify-between text-[10px] text-outline font-mono">
                              <span>Sprint Day 1</span>
                              <span>Ideal Trajectory</span>
                              <span>Sprint Day 14 (Done)</span>
                            </div>
                          </div>

                          <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-tertiary mt-0.5">check_circle</span>
                              <span>Automated GitHub PR link matching closes issues upon release tag deployment.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-sm text-tertiary mt-0.5">check_circle</span>
                              <span>Continuous velocity forecast updates after every completed sprint cycle.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
                          <span className="font-code-xs text-code-xs text-outline">TaskFlow Specification § 4.0</span>
                          <button
                            onClick={() => scrollToBookPage(0)}
                            className="font-medium text-tertiary hover:underline flex items-center gap-1 transition-colors"
                          >
                            <span>Back to Chapter 01</span>
                            <span className="material-symbols-outlined text-sm">arrow_upward</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Footnote & Hint */}
                    <div className="h-9 px-6 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between text-on-surface-variant font-label-sm text-[11px]">
                      <span className="flex items-center gap-1.5 text-outline">
                        <span className="material-symbols-outlined text-sm">swipe_vertical</span>
                        <span>Scroll inside book • or click chapters on left</span>
                      </span>
                      <span className="font-code-xs text-code-xs font-semibold text-primary">
                        TaskFlow Engineering Field Manual v2.4
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* SECTION 4: WORKFLOW TIMELINE */}
          <section className="w-full bg-surface-container-low/70 border-y border-outline-variant/30 py-24" id="workflow">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-3">
                <span className="font-code-xs text-code-xs text-primary font-semibold tracking-wider uppercase">Linear Sprint Process</span>
                <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                  From issue discovery to production release.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  A coherent five-phase pipeline designed for clarity, autonomy, and continuous deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative">
                  <span className="font-mono text-code-xs text-primary font-bold">01</span>
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Define Cycles</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Set fixed 2-week cadences with scoped commitments and team capacity caps.</p>
                  <div className="mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-xs text-code-xs">Setup</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative">
                  <span className="font-mono text-code-xs text-primary font-bold">02</span>
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Assign Pods</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Group designers, backend, and frontend engineers into modular domain tracks.</p>
                  <div className="mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-xs text-code-xs">Team</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative">
                  <span className="font-mono text-code-xs text-primary font-bold">03</span>
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Async Poker</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Estimate point complexity synchronously or async through Slack and CLI prompt.</p>
                  <div className="mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-code-xs text-code-xs">Triage</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative">
                  <span className="font-mono text-code-xs text-primary font-bold">04</span>
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Flow Kanban</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Work without distraction using hotkeys, instant filters, and live peer presence.</p>
                  <div className="mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-code-xs text-code-xs font-semibold">Active</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative">
                  <span className="font-mono text-code-xs text-primary font-bold">05</span>
                  <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Automated Ship</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">PR merge triggers changelog compiling and automated release dispatch.</p>
                  <div className="mt-auto pt-2">
                    <span className="px-2 py-0.5 rounded bg-tertiary-container/10 text-tertiary font-code-xs text-code-xs font-semibold">Release</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: INTERACTIVE DEMO BOARD SELECTOR */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-8" id="demo-board">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="font-code-xs text-code-xs text-primary font-semibold tracking-wider uppercase">Interactive Canvas</span>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
                  Explore the workspace perspective.
                </h2>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant/30 font-label-sm text-label-sm">
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeView === 'board'
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveView('board')}
                  type="button"
                >
                  Board View
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeView === 'list'
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveView('list')}
                  type="button"
                >
                  List View
                </button>
                <button
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeView === 'insights'
                      ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setActiveView('insights')}
                  type="button"
                >
                  Sprint Insights
                </button>
              </div>
            </div>

            {/* Active View Area */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs min-h-[360px]">
              {/* BOARD VIEW */}
              {activeView === 'board' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-on-surface">
                      <span>To Do</span>
                      <span className="text-outline font-mono">3</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-2">
                      <span className="font-code-xs text-code-xs text-outline">CORE-11</span>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Implement SCIM directory sync</p>
                      <div className="flex items-center gap-1 font-code-xs text-code-xs">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">Security</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-2">
                      <span className="font-code-xs text-code-xs text-outline">DX-89</span>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">CLI autocomplete for zsh/fish</p>
                      <div className="flex items-center gap-1 font-code-xs text-code-xs">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">DX</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-primary">
                      <span>Active Sprint</span>
                      <span className="text-primary font-mono">2</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-primary/30 shadow-xs space-y-2">
                      <span className="font-code-xs text-code-xs text-primary font-semibold">UI-301</span>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Fluid animation physics for command popover</p>
                      <div className="flex items-center gap-1 font-code-xs text-code-xs">
                        <span className="px-1.5 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant">Design System</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between font-label-sm text-label-sm font-semibold text-tertiary">
                      <span>Shipped</span>
                      <span className="text-tertiary font-mono">12</span>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-2 opacity-80">
                      <span className="font-code-xs text-code-xs text-outline line-through">API-190</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-through">Multi-region read replicas in EU central</p>
                      <span className="px-1.5 py-0.5 rounded bg-tertiary-container/10 text-tertiary font-code-xs text-code-xs">Done</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LIST VIEW */}
              {activeView === 'list' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 px-3 py-2 font-code-xs text-code-xs text-outline border-b border-outline-variant/20">
                    <span className="col-span-2">Identifier</span>
                    <span className="col-span-6">Title</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-2 text-right">Assignee</span>
                  </div>
                  <div className="grid grid-cols-12 items-center px-3 py-2.5 rounded-lg hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-outline-variant/10">
                    <span className="col-span-2 font-mono text-outline font-code-xs text-code-xs">CORE-11</span>
                    <span className="col-span-6 font-medium">Implement SCIM directory sync</span>
                    <span className="col-span-2 font-code-xs text-code-xs text-outline">To Do</span>
                    <span className="col-span-2 text-right font-code-xs text-code-xs">Alex M.</span>
                  </div>
                  <div className="grid grid-cols-12 items-center px-3 py-2.5 rounded-lg hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-outline-variant/10">
                    <span className="col-span-2 font-mono text-primary font-code-xs text-code-xs font-bold">UI-301</span>
                    <span className="col-span-6 font-medium">Fluid animation physics for command popover</span>
                    <span className="col-span-2 font-code-xs text-code-xs text-primary font-semibold">In Progress</span>
                    <span className="col-span-2 text-right font-code-xs text-code-xs">Sarah C.</span>
                  </div>
                  <div className="grid grid-cols-12 items-center px-3 py-2.5 rounded-lg hover:bg-surface-container-low font-body-sm text-body-sm text-on-surface border border-outline-variant/10">
                    <span className="col-span-2 font-mono text-outline font-code-xs text-code-xs line-through">API-190</span>
                    <span className="col-span-6 text-on-surface-variant line-through">Multi-region read replicas in EU central</span>
                    <span className="col-span-2 font-code-xs text-code-xs text-tertiary">Shipped</span>
                    <span className="col-span-2 text-right font-code-xs text-code-xs">DevOps</span>
                  </div>
                </div>
              )}

              {/* SPRINT INSIGHTS VIEW */}
              {activeView === 'insights' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Average Cycle Completion</span>
                    <p className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">94.2%</p>
                    <span className="font-code-xs text-code-xs text-tertiary">↑ 4.1% from Cycle 13</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Median Review Duration</span>
                    <p className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">3.4 hrs</p>
                    <span className="font-code-xs text-code-xs text-tertiary">↓ 1.2 hrs faster</span>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low space-y-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Weekly Point Throughput</span>
                    <p className="font-headline-lg text-headline-lg font-bold text-on-surface font-mono">48 pts</p>
                    <span className="font-code-xs text-code-xs text-outline">Target: 45 pts</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SECTION 6: WHY TASKFLOW (BENEFITS GRID) */}
          <section className="w-full bg-surface-container-low border-y border-outline-variant/30 py-24" id="solutions">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
              <div className="space-y-3">
                <span className="font-code-xs text-code-xs text-primary font-semibold tracking-wider uppercase">Architecture &amp; Integrity</span>
                <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight max-w-xl">
                  Engineered for engineers. No enterprise cruft.
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">sync_alt</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Zero Context Switching</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Native bi-directional sync with GitHub, GitLab, Sentry incidents, and Slack unfurls. Issues update where your team already chats and writes code.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">bolt</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Under 50ms State Sync</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Local-first indexedDB storage layered on top of CRDT delta synchronization means cards move instantly on screen before hitting the wire.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[22px]">tune</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Opinionated Defaults</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    No mandatory 40-field bug forms. TaskFlow ships with standard statuses, point estimates, and cycles so you never spend a day configuring workflows.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-outline/10 flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[22px]">shield</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Granular RBAC Security</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Enterprise SAML 2.0 / Okta integration, strict role permissions, immutable audit logs, and SOC2 Type II compliance built right in.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7: DEVELOPER-FRIENDLY & ARCHITECTURE SECTION */}
          <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12" id="architecture">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-6">
                <span className="font-code-xs text-code-xs text-primary font-semibold tracking-wider uppercase">Extensible Core</span>
                <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                  Script everything. Automate the rest.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  First-class TypeScript SDK and full OpenAPI REST specs. Trigger issue generation directly from error reporting tools, CI pipelines, or your internal CLI.
                </p>
                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-code-xs text-code-xs text-on-surface font-semibold">
                    TypeScript
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-code-xs text-code-xs text-on-surface font-semibold">
                    PostgreSQL 17
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-code-xs text-code-xs text-on-surface font-semibold">
                    Redis Cluster
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-code-xs text-code-xs text-on-surface font-semibold">
                    OpenAPI 3.1
                  </span>
                  <span className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant/20 font-code-xs text-code-xs text-on-surface font-semibold">
                    Docker
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-2xl bg-[#0b1c30] text-[#eaf1ff] p-6 shadow-xl overflow-hidden font-mono text-code-sm border border-outline-variant/20">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2 text-outline-variant font-code-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"></span>
                    <span className="ml-2 text-gray-400 font-mono">sentry-webhook.ts</span>
                  </div>
                  <span className="text-gray-400 font-code-xs font-mono">SDK v2.4</span>
                </div>
                <pre className="overflow-x-auto leading-relaxed text-[#E2E8F0] font-mono text-xs">
                  <span className="text-[#818CF8]">import</span> &#123; TaskFlowClient &#125; <span className="text-[#818CF8]">from</span> <span className="text-[#34D399]">&apos;@taskflow/sdk&apos;</span>;{'\n\n'}
                  <span className="text-[#818CF8]">const</span> taskflow = <span className="text-[#818CF8]">new</span> TaskFlowClient(&#123;{'\n'}
                  {'  '}apiKey: process.env.TASKFLOW_API_KEY,{'\n'}
                  &#125;);{'\n\n'}
                  <span className="text-[#94A3B8]">Automatically create triage issue from Sentry unhandled exception</span>{'\n'}
                  <span className="text-[#818CF8]">await</span> taskflow.issues.create(&#123;{'\n'}
                  {'  '}workspaceId: <span className="text-[#34D399]">&apos;ws_core_eng&apos;</span>,{'\n'}
                  {'  '}cycleId: <span className="text-[#34D399]">&apos;cycle_current&apos;</span>,{'\n'}
                  {'  '}title: <span className="text-[#34D399]">&apos;Unhandled rejection in WebWorker thread&apos;</span>,{'\n'}
                  {'  '}priority: <span className="text-[#34D399]">&apos;urgent&apos;</span>,{'\n'}
                  {'  '}labels: [<span className="text-[#34D399]">&apos;sentry&apos;</span>, <span className="text-[#34D399]">&apos;reliability&apos;</span>],{'\n'}
                  {'  '}estimate: 3,{'\n'}
                  &#125;);
                </pre>
              </div>
            </div>
          </section>

          {/* SECTION 8: MINIMALIST FAQ ACCORDION */}
          <section className="w-full bg-surface-container-low border-t border-outline-variant/30 py-24" id="faq">
            <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-12">
              <div className="text-center space-y-2">
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Frequently Answered Questions
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Clear, honest answers about architecture, migration, and limits.
                </p>
              </div>

              <div className="space-y-4">
                <details className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer" open>
                  <summary className="flex items-center justify-between font-headline-sm text-headline-sm font-semibold text-on-surface select-none">
                    <span>How does TaskFlow compare to Jira or Linear?</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    TaskFlow combines Linear&apos;s lightning keyboard feel with authentic cycle planning, built-in async estimation poker, and zero-overhead defaults. Unlike Jira, there are zero 15-second page loads or labyrinthine permission matrices.
                  </p>
                </details>

                <details className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-headline-sm text-headline-sm font-semibold text-on-surface select-none">
                    <span>Can we import our existing backlog from GitHub Projects or Trello?</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Yes. We provide 1-click importers for GitHub Issues, Jira Cloud CSV, Linear JSON export, and Trello boards. All historical comments, assignees, and attachments map directly into your TaskFlow workspace.
                  </p>
                </details>

                <details className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-headline-sm text-headline-sm font-semibold text-on-surface select-none">
                    <span>Is there an on-premise or self-hosted deployment option?</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Yes, our open-source codebase supports turnkey Docker Compose manifests with air-gapped deployment capability, self-hosted PostgreSQL/Redis topologies, and full environmental parity.
                  </p>
                </details>

                <details className="group rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-5 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                  <summary className="flex items-center justify-between font-headline-sm text-headline-sm font-semibold text-on-surface select-none">
                    <span>What does the free plan include for small teams?</span>
                    <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">expand_more</span>
                  </summary>
                  <p className="mt-3 font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    The free Community tier includes up to 10 active contributors, unlimited task creation, full Git integration, offline sync, and unlimited sprint cycle histories with no time limits.
                  </p>
                </details>
              </div>
            </div>
          </section>

          {/* SECTION 9: FINAL CALL TO ACTION */}
          <section className="w-full py-28 bg-surface-container-lowest flex flex-col items-center justify-center text-center px-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="font-headline-xl text-headline-xl md:text-[52px] md:leading-[56px] font-bold text-on-surface tracking-[-0.035em]">
                Start managing projects with unprecedented velocity.
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
                Join thousands of high-performing engineering teams shipping faster with TaskFlow.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary !text-white hover:bg-primary-container transition-all shadow-md font-label-md text-label-md font-semibold"
                  href="/register"
                >
                  <span className="!text-white">Get Started with TaskFlow</span>
                  <span className="material-symbols-outlined text-[18px] !text-white">arrow_forward</span>
                </Link>
                <Link
                  className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-surface-container-lowest text-on-surface border border-outline-variant/40 hover:bg-surface-container-low transition-all shadow-xs font-label-md text-label-md font-medium"
                  href="/login"
                >
                  <span>Talk to Engineering</span>
                </Link>
              </div>
              <div className="pt-6 font-code-xs text-code-xs text-outline flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/30 text-on-surface">⌘K</kbd> anywhere on the page to search docs</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)] border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
            <div className="lg:col-span-2 flex flex-col justify-between pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#4f46e5] flex items-center justify-center text-white shadow-xs">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16M4 12h11M4 18h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="font-headline-md text-headline-md tracking-tight font-bold text-on-surface">TaskFlow</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                  Project management engineered for speed, clarity, and deep work. Built for world-class product teams who ship relentlessly.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-container/10 font-label-sm text-label-sm text-tertiary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container"></span>
                  </span>
                  <span>All systems operational</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-4">Product</h4>
              <ul className="space-y-2.5 font-body-sm text-body-sm list-none p-0">
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#features">Features</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#workflow">Roadmap</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#top-announcement-bar">Changelog</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#solutions">Integrations</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#architecture">CLI Tooling</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-4">Company</h4>
              <ul className="space-y-2.5 font-body-sm text-body-sm list-none p-0">
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#solutions">About</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#solutions">Manifesto</a></li>
                <li>
                  <a className="text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-2" href="#solutions">
                    <span>Careers</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-secondary/10 text-secondary font-code-xs text-code-xs">We&apos;re hiring</span>
                  </a>
                </li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#solutions">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-4">Developers</h4>
              <ul className="space-y-2.5 font-body-sm text-body-sm list-none p-0">
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors font-code-sm text-code-sm" href="#architecture">REST API</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors font-code-sm text-code-sm" href="#architecture">Webhooks</a></li>
                <li><a className="text-on-surface-variant hover:text-on-surface transition-colors font-code-sm text-code-sm" href="#architecture">TypeScript SDK</a></li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-on-surface transition-colors font-code-sm text-code-sm"
                    href="https://github.com/SoumadeepGhosh/TuskFlow"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub Repo
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/20">
            <div className="flex items-center gap-6">
              <span>© {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</span>
              <a className="hover:text-on-surface transition-colors" href="#faq">Privacy &amp; Terms</a>
            </div>
            <div className="flex items-center gap-2 font-code-xs text-code-xs text-outline">
              <span className="material-symbols-outlined text-[14px]">keyboard</span>
              <span>Press <kbd className="px-1 py-0.5 rounded bg-surface-container-high text-on-surface">?</kbd> for shortcuts</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
