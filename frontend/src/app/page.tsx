'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Kanban, ShieldCheck, Zap } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/workspaces');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-background overflow-hidden">
      {/* Background radial gradient */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[1000px] rounded-full bg-gradient-to-b from-[#EEF0FF] to-transparent blur-3xl opacity-80" />

      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
            <Kanban className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Task<span className="text-primary">Flow</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center py-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent text-primary text-xs font-semibold mb-8 border border-primary/20">
          <Zap className="h-3.5 w-3.5" />
          <span>Next-Generation Project Orchestration</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl leading-[1.1]">
          Manage tasks with <span className="text-primary">clarity</span>, speed, and precision.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          TaskFlow unifies Kanban boards, team workspaces, task assignments, and real-time updates in a distraction-free environment.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" asChild>
            <Link href="/register" className="flex items-center gap-2">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
            <Link href="/login">Sign in to your team</Link>
          </Button>
        </div>

        {/* Feature Badges */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl w-full">
          <div className="p-6 rounded-[20px] bg-card border border-border shadow-soft">
            <div className="h-9 w-9 rounded-xl bg-accent text-primary flex items-center justify-center mb-3">
              <Kanban className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Kanban Board</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Drag-and-drop columns, reorder tasks, and track statuses seamlessly.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-card border border-border shadow-soft">
            <div className="h-9 w-9 rounded-xl bg-accent text-primary flex items-center justify-center mb-3">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Real-time Sockets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Instant notification dispatches and assignment broadcasts as they happen.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-card border border-border shadow-soft">
            <div className="h-9 w-9 rounded-xl bg-accent text-primary flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground text-base">Role-Based Access</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Workspaces, projects, and granular membership control for teams.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
        <p>&copy; {new Date().getFullYear()} TaskFlow Inc. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-foreground font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            Production Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
