'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Project } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteProjectMutation } from '../hooks/use-projects';
import { getAssetUrl } from '@/lib/assets';
import {
  ArrowRight,
  CheckSquare,
  FolderKanban,
  MoreVertical,
  Trash2,
  Users,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectMutation();

  const boardCount = project._count?.boards ?? 0;
  const taskCount = project._count?.tasks ?? 0;
  const memberCount = project._count?.members ?? project.members?.length ?? 0;

  const color = project.color || '#5B5CEB';

  const handleDelete = () => {
    deleteProject(project.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click occurred inside an element marked with data-prevent-navigate or button/menu, skip
    const target = e.target as HTMLElement;
    if (target.closest('[data-prevent-navigate="true"]')) {
      return;
    }
    router.push(`/projects/${project.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-prevent-navigate="true"]')) {
        e.preventDefault();
        router.push(`/projects/${project.id}`);
      }
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        className="group relative flex flex-col justify-between rounded-[20px] border border-border bg-card shadow-soft hover:shadow-soft-hover hover:border-primary/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 text-left overflow-hidden"
      >
        {/* Cover banner if present */}
        {project.coverUrl ? (
          <div className="h-20 w-full relative overflow-hidden bg-muted">
            <img
              src={getAssetUrl(project.coverUrl)}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>
        ) : (
          <div
            className="h-2.5 w-full shrink-0"
            style={{ backgroundColor: color }}
          />
        )}

        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden"
                  style={{ backgroundColor: color }}
                >
                  {project.logoUrl ? (
                    <img
                      src={getAssetUrl(project.logoUrl)}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    project.name.substring(0, 2).toUpperCase()
                  )}
                </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/projects/${project.id}`}
                    data-prevent-navigate="true"
                    className="font-semibold text-foreground text-base tracking-tight group-hover:text-primary transition-colors truncate block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {project.name}
                  </Link>

                  {project.key && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground border border-border/50 shrink-0">
                      {project.key}
                    </span>
                  )}
                </div>

                {project.workspace && (
                  <span className="text-xs text-muted-foreground block mt-0.5 truncate">
                    {project.workspace.name}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative shrink-0" data-prevent-navigate="true">
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-60 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Project actions</span>
              </Button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                  />
                  <div className="absolute right-0 top-8 z-30 w-36 rounded-[14px] border border-border bg-card p-1.5 shadow-xl">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Project
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="mt-3.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
            {project.description || 'No description provided.'}
          </p>

          {/* Stats Bar */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium" title={`${boardCount} boards`}>
              <FolderKanban className="h-3.5 w-3.5 text-primary" />
              {boardCount} {boardCount === 1 ? 'board' : 'boards'}
            </span>
            <span className="flex items-center gap-1.5 font-medium" title={`${taskCount} tasks`}>
              <CheckSquare className="h-3.5 w-3.5" />
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </span>
            {memberCount > 0 && (
              <span className="flex items-center gap-1.5 font-medium" title={`${memberCount} contributors`}>
                <Users className="h-3.5 w-3.5" />
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
          <Badge
            variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
            className="text-[10px] font-semibold"
          >
            {project.status === 'ACTIVE' ? '● Active' : 'Archived'}
          </Badge>

          <Link
            href={`/projects/${project.id}`}
            data-prevent-navigate="true"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white group-hover:bg-primary group-hover:text-white transition-all duration-200"
          >
            <span>Open Project</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${project.name}"?`}
        description="This will permanently delete this project, its boards, and all associated tasks."
        confirmLabel="Delete Project"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
