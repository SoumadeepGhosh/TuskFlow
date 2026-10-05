'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useWorkspaces } from '@/features/workspace/hooks/use-workspaces';
import { CreateWorkspaceDialog } from '@/features/workspace/components/create-workspace-dialog';
import { Workspace } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Briefcase,
  ChevronDown,
  FolderKanban,
  Kanban,
  LogOut,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: workspacesData } = useWorkspaces({ limit: 10 });
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const rawData = workspacesData as unknown;
  const workspaces: Workspace[] = Array.isArray(rawData)
    ? (rawData as Workspace[])
    : (workspacesData?.items ?? []);
  const activeWorkspace = workspaces[0];

  const navItems = [
    {
      label: 'Workspaces',
      href: '/workspaces',
      icon: Briefcase,
      active: pathname.startsWith('/workspaces'),
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: FolderKanban,
      active: pathname.startsWith('/projects'),
    },
    {
      label: 'Boards',
      href: '/boards',
      icon: Kanban,
      active: pathname.startsWith('/boards'),
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      active: pathname.startsWith('/notifications'),
    },
  ];

  return (
    <>
      <aside className="w-64 shrink-0 flex flex-col justify-between border-r border-border bg-card h-full select-none">
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-16 px-5 border-b border-border flex items-center justify-between">
            <Link
              href="/workspaces"
              className="flex items-center gap-2.5"
              onClick={onCloseMobile}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/25">
                <Kanban className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">
                Task<span className="text-primary">Flow</span>
              </span>
            </Link>
          </div>

          {/* Workspace Switcher */}
          <div className="p-3 border-b border-border relative">
            <button
              onClick={() => setShowWorkspaceSwitcher((prev) => !prev)}
              className="w-full flex items-center justify-between p-2 rounded-[12px] bg-secondary/60 hover:bg-secondary text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="h-7 w-7 rounded-[8px] bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {activeWorkspace
                    ? activeWorkspace.name.substring(0, 2).toUpperCase()
                    : 'TF'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {activeWorkspace?.name ?? 'Select Workspace'}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    Active team
                  </p>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
            </button>

            {/* Switcher dropdown */}
            {showWorkspaceSwitcher && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowWorkspaceSwitcher(false)}
                />
                <div className="absolute left-3 right-3 top-14 z-40 rounded-[14px] border border-border bg-card p-1.5 shadow-xl space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspaces
                  </div>
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.id}
                      href={`/workspaces/${ws.id}`}
                      onClick={() => {
                        setShowWorkspaceSwitcher(false);
                        onCloseMobile?.();
                      }}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-[10px] text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      <span className="truncate">{ws.name}</span>
                      {ws.id === activeWorkspace?.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  ))}

                  <div className="border-t border-border pt-1">
                    <button
                      onClick={() => {
                        setShowWorkspaceSwitcher(false);
                        setShowCreateDialog(true);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[10px] text-xs font-medium text-primary hover:bg-accent transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create Workspace
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs font-semibold transition-all ${
                    item.active
                      ? 'bg-accent text-primary shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between p-2 rounded-[12px] hover:bg-secondary/60 transition-colors">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-accent text-primary font-semibold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => void logout()}
              className="text-muted-foreground hover:text-destructive shrink-0"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
