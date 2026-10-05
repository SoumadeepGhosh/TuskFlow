'use client';

import React from 'react';
import Link from 'next/link';
import { Workspace } from '@/types/workspace';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronRight,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';

interface WorkspaceCardProps {
  workspace: Workspace;
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspace: Workspace) => void;
}

export function WorkspaceCard({ workspace, onEdit, onDelete }: WorkspaceCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  const memberCount =
    workspace._count?.members ?? workspace.members?.length ?? 1;
  const projectCount = workspace._count?.projects ?? 0;

  const initials = workspace.name
    ? workspace.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'W';

  return (
    <Card className="p-6 flex flex-col justify-between hover:shadow-md hover:border-primary/40 transition-all group relative">
      <div>
        {/* Top Header: Logo, Name & Action Dropdown */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-accent text-primary flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <Link
                href={`/workspaces/${workspace.id}`}
                className="font-bold text-base text-foreground group-hover:text-primary transition-colors block truncate"
              >
                {workspace.name}
              </Link>
              <span className="text-[11px] text-muted-foreground block truncate">
                /{workspace.slug}
              </span>
            </div>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl bg-card border border-border shadow-lg p-1 z-30 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(workspace);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-secondary text-left font-medium transition-colors text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(workspace);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive text-left font-medium transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[32px]">
          {workspace.description || 'No description provided.'}
        </p>

        {/* Counts: Members & Projects */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <FolderKanban className="h-3.5 w-3.5 text-primary" />
            <span>{projectCount} {projectCount === 1 ? 'project' : 'projects'}</span>
          </div>
        </div>
      </div>

      {/* Footer: Date & View Button */}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(workspace.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>

        <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs gap-1 font-semibold group/btn">
          <Link href={`/workspaces/${workspace.id}`}>
            View
            <ChevronRight className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
