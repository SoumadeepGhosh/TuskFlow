'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Bell, Menu, Search } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
      {/* Left: Mobile Sidebar Trigger & Global Search */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Global Search Bar Placeholder */}
        <div className="relative hidden sm:flex items-center w-64 md:w-80">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects, tasks, or boards..."
            className="w-full h-9 pl-9 pr-3 rounded-[12px] bg-secondary border border-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-border focus:bg-card transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Avatar */}
      <div className="flex items-center gap-3">
        <Link href="/notifications">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </Link>

        <div className="h-4 w-px bg-border mx-0.5" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-primary text-xs font-bold border border-primary/20">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-foreground">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}
