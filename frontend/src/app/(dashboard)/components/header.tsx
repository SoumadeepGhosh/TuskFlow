'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import {
  Menu,
  Search,
  User as UserIcon,
  Settings,
  Bell,
  Briefcase,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { NotificationCenter } from '@/features/notification/components/notification-center';
import { UserAvatar } from '@/components/ui/user-avatar';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

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

      {/* Right: Notifications & Profile Button */}
      <div className="flex items-center gap-3">
        {/* Enterprise Notification Center Bell */}
        <NotificationCenter />

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* User Profile Button with Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu((prev) => !prev)}
            className={cn(
              'flex items-center gap-2 p-1.5 rounded-full hover:bg-secondary transition-all cursor-pointer select-none',
              showUserMenu && 'bg-secondary',
            )}
            title="Profile & Settings"
          >
            <UserAvatar user={user} size="md" showStatus status="online" />
            <span className="hidden md:inline text-xs font-semibold text-foreground max-w-[120px] truncate">
              {user?.name || 'My Account'}
            </span>
            <ChevronDown className="hidden md:inline h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
              {/* User Header */}
              <div className="px-3 py-2 border-b border-border/80 mb-1">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>

              {/* Navigation Links */}
              <div className="space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span>View Profile</span>
                </Link>

                <Link
                  href="/workspace"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Workspace Hub</span>
                </Link>

                <Link
                  href="/settings/notifications"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Notification Settings</span>
                </Link>
              </div>

              <div className="border-t border-border/80 my-1" />

              {/* Sign Out */}
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  void logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
