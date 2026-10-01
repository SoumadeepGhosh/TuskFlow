'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
} from '@/features/workspace/hooks/use-workspaces';
import { MemberList } from '@/features/workspace/components/member-list';
import { InviteMemberDialog } from '@/features/workspace/components/invite-member-dialog';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Briefcase,
  FolderKanban,
  Plus,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params?.id);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'settings'>('overview');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const { data: membersData, isLoading: isLoadingMembers } = useWorkspaceMembers(workspaceId);

  const { mutate: updateWorkspace, isPending: isUpdating } = useUpdateWorkspaceMutation(workspaceId);
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteWorkspaceMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || '');
    }
  }, [workspace]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <div className="p-8 text-center rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Workspace not found or you don&apos;t have access.
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push('/workspaces')}>
          Back to Workspaces
        </Button>
      </div>
    );
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateWorkspace({ name, description });
  };

  const handleDeleteWorkspace = () => {
    deleteWorkspace(workspaceId, {
      onSuccess: () => router.push('/workspaces'),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={workspace.name}
        description={workspace.description || `Workspace slug: /${workspace.slug}`}
        breadcrumbs={[
          { label: 'Workspaces', href: '/workspaces' },
          { label: workspace.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInviteDialog(true)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href={`/projects/new?workspaceId=${workspaceId}`}>
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        }
      />

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-[12px] border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary bg-accent/40'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          Projects & Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-[12px] border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-primary text-primary bg-accent/40'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Members ({membersData?.items?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-[12px] border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-primary text-primary bg-accent/40'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Tab: Overview / Projects */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-[20px] border border-border bg-card shadow-soft">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Projects
              </span>
              <p className="text-2xl font-bold text-foreground mt-1.5">
                {workspace._count?.projects ?? 0}
              </p>
            </div>
            <div className="p-5 rounded-[20px] border border-border bg-card shadow-soft">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Team Members
              </span>
              <p className="text-2xl font-bold text-foreground mt-1.5">
                {membersData?.items?.length ?? 0}
              </p>
            </div>
            <div className="p-5 rounded-[20px] border border-border bg-card shadow-soft">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </span>
              <p className="text-base font-semibold text-foreground mt-2">
                {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Workspace Projects</h2>
            <Button size="sm" asChild>
              <Link href={`/projects/new?workspaceId=${workspaceId}`}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create Project
              </Link>
            </Button>
          </div>

          <div className="p-8 text-center rounded-[20px] border border-dashed border-border bg-card/50">
            <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">Projects in {workspace.name}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Create a project to set up Kanban boards, track backlog items, and assign tasks.
            </p>
            <Button size="sm" className="mt-4" asChild>
              <Link href={`/projects/new?workspaceId=${workspaceId}`}>
                Get Started with a Project
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Team Members</h2>
              <p className="text-xs text-muted-foreground">
                Manage roles and invitations for this workspace.
              </p>
            </div>
            <Button size="sm" onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite Member
            </Button>
          </div>

          <MemberList
            workspaceId={workspaceId}
            members={membersData?.items}
            isLoading={isLoadingMembers}
            onInviteClick={() => setShowInviteDialog(true)}
          />
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-[20px] border border-border bg-card shadow-soft space-y-5">
            <h2 className="text-lg font-bold text-foreground">Workspace General Settings</h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspace Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Workspace Name"
                  disabled={isUpdating}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Workspace Description"
                  disabled={isUpdating}
                  className="w-full rounded-[14px] border border-border bg-card px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="p-6 rounded-[20px] border border-destructive/20 bg-destructive/5 space-y-3">
            <h3 className="text-base font-bold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">
              Deleting this workspace will permanently erase all associated projects, boards, tasks, comments, and member associations.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete Workspace
            </Button>
          </div>
        </div>
      )}

      <InviteMemberDialog
        workspaceId={workspaceId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${workspace.name}"?`}
        description="This will permanently delete this workspace and all contained data. This cannot be undone."
        confirmLabel="Delete Workspace"
        isPending={isDeleting}
        onConfirm={handleDeleteWorkspace}
      />
    </div>
  );
}

