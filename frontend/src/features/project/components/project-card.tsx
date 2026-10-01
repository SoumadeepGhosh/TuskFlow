'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useDeleteProjectMutation } from '../hooks/use-projects';
import { CheckSquare, FolderKanban, Kanban, MoreVertical, Trash2, Users } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProjectMutation();

  const boardCount = project._count?.boards ?? 0;
  const taskCount = project._count?.tasks ?? 0;
  const memberCount = project._count?.members ?? 0;

  const color = project.color || '#5B5CEB';

  const handleDelete = () => {
    deleteProject(project.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  return (
    <>
      <Card className="group relative hover:border-primary/40 hover:shadow-soft-hover transition-all duration-200">
        <Link
          href={`/projects/${project.id}`}
          className="absolute inset-0 z-0"
        />

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
              >
                {project.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base tracking-tight group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                {project.workspace && (
                  <span className="text-xs text-muted-foreground">
                    {project.workspace.name}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
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

          {project.description && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-border pt-3.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-3.5">
              <span className="flex items-center gap-1.5">
                <Kanban className="h-3.5 w-3.5 text-primary" />
                {boardCount} {boardCount === 1 ? 'board' : 'boards'}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" />
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            <Badge
              variant={project.status === 'ACTIVE' ? 'success' : 'secondary'}
              className="text-[10px]"
            >
              {project.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

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

