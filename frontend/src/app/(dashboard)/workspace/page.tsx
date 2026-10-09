'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useWorkspaces,
  useWorkspace,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useUploadWorkspaceLogoMutation,
  useRemoveWorkspaceLogoMutation,
  useUploadWorkspaceCoverMutation,
  useRemoveWorkspaceCoverMutation,
} from '@/features/workspace/hooks/use-workspaces';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useBoards } from '@/features/board/hooks/use-boards';
import { useTasks } from '@/features/task/hooks/use-tasks';
import { workspaceService } from '@/services/workspace.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from '@/types/workspace';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { InviteMemberDialog } from '@/features/workspace/components/invite-member-dialog';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { getAssetUrl } from '@/lib/assets';
import {
  Briefcase,
  Users,
  FolderKanban,
  Kanban,
  CheckCircle2,
  HardDrive,
  Settings,
  Shield,
  Key,
  Webhook,
  CreditCard,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
  Mail,
  MoreHorizontal,
  ExternalLink,
  Edit3,
  Clock,
  Sparkles,
  Trash2,
  Send,
  UserCheck,
  Check,
  Copy,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function WorkspacePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Active Workspace
  const { data: workspacesData, isLoading: isLoadingWorkspaces } = useWorkspaces({ limit: 10 });
  const rawWorkspaces = workspacesData as unknown;
  const workspaces: Workspace[] = Array.isArray(rawWorkspaces)
    ? (rawWorkspaces as Workspace[])
    : (workspacesData?.items ?? []);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);

  const activeWorkspaceId = selectedWorkspaceId || workspaces[0]?.id;

  const { data: workspace, isLoading: isLoadingDetail } = useWorkspace(activeWorkspaceId);

  // Logo & Cover Mutations
  const uploadLogoMutation = useUploadWorkspaceLogoMutation(activeWorkspaceId);
  const removeLogoMutation = useRemoveWorkspaceLogoMutation(activeWorkspaceId);
  const uploadCoverMutation = useUploadWorkspaceCoverMutation(activeWorkspaceId);
  const removeCoverMutation = useRemoveWorkspaceCoverMutation(activeWorkspaceId);
  const [workspaceLightboxImage, setWorkspaceLightboxImage] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'members' | 'activity' | 'settings' | 'integrations' | 'api-keys' | 'billing' | 'audit-logs'
  >('overview');

  // Dialogs
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // API Key Generator Mock State
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; prefix: string; createdAt: string }[]>([
    { id: '1', name: 'Production CI/CD Webhook', prefix: 'tf_live_948a...', createdAt: '2026-10-01' },
    { id: '2', name: 'GitHub Action Deployer', prefix: 'tf_live_21bc...', createdAt: '2026-10-05' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');

  // Invitations Query
  const { data: invitations = [] } = useQuery({
    queryKey: ['workspaces', activeWorkspaceId, 'invitations'],
    queryFn: () => workspaceService.getInvitations(activeWorkspaceId),
    enabled: !!activeWorkspaceId,
  });

  // Projects, Boards, Tasks for Statistics
  const { data: projectsData } = useProjects({ workspaceId: activeWorkspaceId, limit: 100 });
  const { data: boardsData } = useBoards({ limit: 100 });
  const { data: tasksData } = useTasks({ limit: 100 });

  const projects = projectsData?.items || [];
  const boards = boardsData?.items || [];
  const tasks = tasksData?.items || [];

  const updateMutation = useUpdateWorkspaceMutation(activeWorkspaceId);
  const deleteMutation = useDeleteWorkspaceMutation();

  const members: WorkspaceMember[] = workspace?.members || [];
  const memberCount = workspace?._count?.members ?? members.length ?? 1;
  const projectCount = workspace?._count?.projects ?? projects.length;

  const handleStartEdit = () => {
    if (workspace) {
      setEditName(workspace.name);
      setEditDescription(workspace.description || '');
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error('Workspace name cannot be empty');
      return;
    }
    updateMutation.mutate(
      { name: editName.trim(), description: editDescription.trim() || undefined },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          toast.success('Workspace updated successfully');
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(activeWorkspaceId, {
      onSuccess: () => {
        router.push('/workspaces');
      },
    });
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error('Key name is required');
      return;
    }
    const token = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      prefix: `tf_live_${Math.random().toString(36).substring(2, 8)}...`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setApiKeys([...apiKeys, token]);
    setNewKeyName('');
    toast.success('Generated new API Key token');
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast.success('API key revoked');
  };

  if (isLoadingWorkspaces || (activeWorkspaceId && isLoadingDetail)) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3 max-w-xl mx-auto my-12">
        <p className="text-sm font-semibold text-destructive">
          No workspace found. Please create one to get started.
        </p>
        <Link href="/workspaces">
          <Button variant="outline" size="sm">Go to Workspaces</Button>
        </Link>
      </div>
    );
  }

  const workspaceInitial = (workspace.name || 'W').charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Banner */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        {workspace.coverUrl ? (
          <div className="h-36 sm:h-52 w-full relative group">
            <img
              src={getAssetUrl(workspace.coverUrl)}
              alt={`${workspace.name} Banner`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setWorkspaceLightboxImage(workspace.coverUrl || null)}
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('settings')}
                className="text-xs font-semibold backdrop-blur-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Change Banner
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-32 sm:h-44 bg-gradient-to-r from-primary/15 via-accent/30 to-primary/10 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTab('settings')}
                className="text-xs font-semibold backdrop-blur-md shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Banner
              </Button>
            </div>
          </div>
        )}

        {/* Workspace Info & Logo Overlay */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Logo */}
            <div
              className="relative cursor-pointer group"
              onClick={() => {
                if (workspace.logoUrl) setWorkspaceLightboxImage(workspace.logoUrl);
                else setActiveTab('settings');
              }}
              title={workspace.logoUrl ? 'Click to view logo' : 'Click to add logo'}
            >
              {workspace.logoUrl ? (
                <img
                  src={getAssetUrl(workspace.logoUrl)}
                  alt={workspace.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-card shadow-xl bg-card"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary text-primary-foreground font-black text-2xl sm:text-3xl flex items-center justify-center border-4 border-card shadow-xl">
                  {workspaceInitial}
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {workspace.name}
                </h1>
                {workspaces.length > 1 && (
                  <select
                    value={activeWorkspaceId}
                    onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
                    className="h-7 text-xs rounded-lg border border-border bg-secondary px-2 text-foreground font-medium cursor-pointer"
                  >
                    {workspaces.map((ws) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {workspace.description || 'Enterprise collaboration and agile project management workspace.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleStartEdit} className="text-xs font-semibold">
              <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            <Button size="sm" onClick={() => setShowInviteDialog(true)} className="text-xs font-semibold shadow-xs">
              <Users className="w-3.5 h-3.5 mr-1" /> Invite Members
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Projects</span>
            <FolderKanban className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{projectCount}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Boards</span>
            <Kanban className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{boards.length}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{tasks.length}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Members</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{memberCount}</h3>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Storage</span>
            <HardDrive className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">24.5 MB</h3>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-border pb-1 text-xs">
        {[
          { id: 'overview', label: 'Overview & Projects', icon: Briefcase },
          { id: 'members', label: `Members (${memberCount})`, icon: Users },
          { id: 'activity', label: 'Activity Log', icon: Activity },
          { id: 'integrations', label: 'Integrations', icon: Webhook },
          { id: 'api-keys', label: 'API Keys', icon: Key },
          { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
          { id: 'audit-logs', label: 'Audit Logs', icon: FileSpreadsheet },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Workspace Projects</h3>
            <Link href="/projects">
              <Button size="sm" variant="outline" className="text-xs">
                View All Projects →
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-border bg-card space-y-3">
              <FolderKanban className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <h4 className="text-sm font-semibold text-foreground">No projects yet</h4>
              <p className="text-xs text-muted-foreground">Create your first project to start organizing team work.</p>
              <Link href="/projects">
                <Button size="sm">Create Project</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-5 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all space-y-3 block"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground truncate">{project.name}</h4>
                    <Badge variant="outline" className="text-[10px]">
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{project._count?.boards || 0} Boards</span>
                    <span>{project._count?.tasks || 0} Tasks</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMBERS & INVITATIONS */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Active Team Members ({members.length})</h3>
            <Button size="sm" onClick={() => setShowInviteDialog(true)} className="text-xs">
              <Users className="w-3.5 h-3.5 mr-1" /> Invite Member
            </Button>
          </div>

          {/* Members Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs divide-y divide-border">
            <div className="p-3 bg-secondary/40 grid grid-cols-12 text-xs font-bold text-muted-foreground">
              <div className="col-span-5">Member</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Joined</div>
            </div>

            {members.map((member) => (
              <div key={member.id} className="p-3.5 grid grid-cols-12 items-center text-xs hover:bg-secondary/20 transition-colors">
                <div className="col-span-5 flex items-center gap-3">
                  <UserAvatar
                    user={member.user}
                    size="md"
                    showStatus
                    status="online"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-foreground truncate">{member.user?.name || 'Member'}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{member.user?.email}</p>
                  </div>
                </div>

                <div className="col-span-3">
                  <Badge variant="outline" className="text-[10px]">
                    {member.role}
                  </Badge>
                </div>

                <div className="col-span-2">
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {member.status}
                  </span>
                </div>

                <div className="col-span-2 text-right text-muted-foreground text-[11px]">
                  {new Date(member.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Invitations Section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pending Invitations ({invitations.length})
            </h4>

            {invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No pending invitations.</p>
            ) : (
              <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{inv.email}</span>
                      <Badge variant="secondary" className="text-[10px]">{inv.role}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-500 font-semibold uppercase">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
            Workspace Activity Log
          </h3>

          <div className="space-y-4 relative pl-5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            <div className="relative space-y-0.5">
              <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
              <p className="text-xs font-semibold text-foreground">Workspace created</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(workspace.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="relative space-y-0.5">
                <span className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                <p className="text-xs font-semibold text-foreground">Project &quot;{p.name}&quot; added</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRATIONS */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Connected Integrations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-sm text-foreground">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Webhook className="w-4 h-4" />
                  </div>
                  GitHub Sync
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Connected</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically link pull requests, commits, and branch merges to TaskFlow tasks.
              </p>
              <Button variant="outline" size="sm" className="text-xs">Configure</Button>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-bold text-sm text-foreground">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  Slack Alerts
                </div>
                <Badge variant="secondary" className="text-[10px]">Available</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Dispatch task updates, sprint completions, and urgent notices into Slack channels.
              </p>
              <Button size="sm" className="text-xs">Connect</Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: API KEYS */}
      {activeTab === 'api-keys' && (
        <div className="space-y-5 max-w-3xl">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Developer API Tokens</h3>
            <p className="text-xs text-muted-foreground">
              Personal access tokens grant full programmatic access to workspace projects and tasks via REST API.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="Token description (e.g. Jenkins Runner)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="text-xs"
              />
              <Button size="sm" onClick={handleCreateApiKey} className="text-xs shrink-0">
                Generate Token
              </Button>
            </div>

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-semibold text-foreground">{key.name}</h5>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{key.prefix}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteApiKey(key.id)}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BILLING */}
      {activeTab === 'billing' && (
        <div className="space-y-4 max-w-2xl">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Enterprise Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Unlimited team seats, unlimited projects, realtime sockets</p>
              </div>
              <Badge className="text-xs font-bold">Active</Badge>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-semibold text-foreground">November 1, 2026</span>
            </div>

            <Button variant="outline" size="sm" className="text-xs">
              Manage Subscription
            </Button>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit-logs' && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
            Compliance & Audit Trail
          </h3>
          <p className="text-xs text-muted-foreground">
            Immutable log of all user authentication, permission escalations, and resource deletions.
          </p>

          <div className="rounded-xl border border-border divide-y divide-border text-xs">
            <div className="p-3 flex items-center justify-between">
              <span>Member invited: developer1@recieve.money</span>
              <span className="text-muted-foreground text-[11px]">Today at 12:45 PM</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span>Project settings updated</span>
              <span className="text-muted-foreground text-[11px]">Yesterday at 4:12 PM</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span>Column created: &quot;In Progress&quot;</span>
              <span className="text-muted-foreground text-[11px]">3 days ago</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-2xl">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-5 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">Workspace Branding & Assets</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                label="Workspace Logo"
                helperText="Square icon for headers & switchers"
                value={workspace.logoUrl}
                aspectRatio="logo"
                onUpload={async (file) => {
                  await uploadLogoMutation.mutateAsync(file);
                }}
                onRemove={async () => {
                  await removeLogoMutation.mutateAsync();
                }}
              />

              <ImageUpload
                label="Workspace Banner / Cover"
                helperText="16:9 banner for top hero display"
                value={workspace.coverUrl}
                aspectRatio="banner"
                onUpload={async (file) => {
                  await uploadCoverMutation.mutateAsync(file);
                }}
                onRemove={async () => {
                  await removeCoverMutation.mutateAsync();
                }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground">Workspace Details</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Workspace Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button size="sm" onClick={handleSaveEdit} isLoading={updateMutation.isPending}>
              Save Workspace
            </Button>
          </div>

          <div className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
            <h3 className="text-sm font-bold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground">
              Permanently delete this workspace and all associated projects, tasks, and data.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Workspace
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <InviteMemberDialog
        workspaceId={activeWorkspaceId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Workspace"
        description={`Are you sure you want to permanently delete "${workspace.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Edit Workspace Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogHeader onClose={() => setShowEditDialog(false)}>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>Update workspace information and branding.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 overflow-y-auto max-h-[65vh] pr-1">
          <ImageUpload
            label="Workspace Logo"
            value={workspace.logoUrl}
            aspectRatio="logo"
            onUpload={async (file) => {
              await uploadLogoMutation.mutateAsync(file);
            }}
            onRemove={async () => {
              await removeLogoMutation.mutateAsync();
            }}
          />

          <ImageUpload
            label="Workspace Banner / Cover"
            value={workspace.coverUrl}
            aspectRatio="banner"
            onUpload={async (file) => {
              await uploadCoverMutation.mutateAsync(file);
            }}
            onRemove={async () => {
              await removeCoverMutation.mutateAsync();
            }}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Name</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} isLoading={updateMutation.isPending}>Save</Button>
        </DialogFooter>
      </Dialog>

      {/* Workspace Lightbox */}
      {workspaceLightboxImage && (
        <ImageLightbox
          open={!!workspaceLightboxImage}
          onClose={() => setWorkspaceLightboxImage(null)}
          src={workspaceLightboxImage}
          title={workspace.name}
        />
      )}
    </div>
  );
}

