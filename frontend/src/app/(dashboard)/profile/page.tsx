'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { useMyTasks } from '@/features/task/hooks/use-tasks';
import { useProjects } from '@/features/project/hooks/use-projects';
import { useBoards } from '@/features/board/hooks/use-boards';
import { TaskDetailModal } from '@/features/task/components/task-detail-modal';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Kanban,
  MessageSquare,
  Paperclip,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  Shield,
  Settings,
  Bell,
  Key,
  Palette,
  ExternalLink,
  Edit3,
  Award,
  Sparkles,
  Camera,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/ui/user-avatar';
import { ImageUpload } from '@/components/ui/image-upload';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import {
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useChangePasswordMutation,
} from '@/features/auth/hooks/use-auth-mutations';

export default function ProfilePage() {
  const { user } = useAuth();

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const removeAvatarMutation = useRemoveAvatarMutation();
  const changePasswordMutation = useChangePasswordMutation();

  // Dialogs & Lightbox
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [avatarLightboxOpen, setAvatarLightboxOpen] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // Edit form states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [bio, setBio] = useState('Senior Product Engineer crafting high-velocity developer tools and workflows.');
  const [department, setDepartment] = useState('Product Engineering');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState('San Francisco, CA');
  const [timezone, setTimezone] = useState('PST (UTC-8)');
  const [skills, setSkills] = useState(['Next.js', 'TypeScript', 'React 19', 'PostgreSQL', 'NestJS', 'UI/UX', 'System Design']);
  const [newSkill, setNewSkill] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Task Detail Modal
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Queries
  const { data: myTasks = [], isLoading: isLoadingTasks } = useMyTasks();
  const { data: projectsData, isLoading: isLoadingProjects } = useProjects({ limit: 10 });
  const { data: boardsData, isLoading: isLoadingBoards } = useBoards({ limit: 10 });

  const projects = projectsData?.items || [];
  const boards = boardsData?.items || [];

  // Statistics
  const stats = useMemo(() => {
    const totalAssigned = myTasks.length;
    const completed = myTasks.filter((t) => t.status === 'DONE').length;
    const completionRate =
      totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 100;

    let totalComments = 0;
    let totalAttachments = 0;
    myTasks.forEach((t) => {
      totalComments += t._count?.comments || 0;
      totalAttachments += t._count?.attachments || 0;
    });

    return {
      totalAssigned,
      completed,
      completionRate,
      projectCount: projects.length,
      boardCount: boards.length,
      totalComments,
      totalAttachments,
    };
  }, [myTasks, projects, boards]);

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({ name: profileName });
      setShowEditProfile(false);
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Error handled by mutation onError
    }
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkill.trim())) {
        setSkills([...skills, newSkill.trim()]);
      }
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        {/* Cover Graphic / Banner */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-primary/15 via-accent/30 to-primary/10 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEditProfile(true)}
              className="text-xs font-semibold backdrop-blur-md shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar & Quick Upload */}
            <div className="relative group">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    await uploadAvatarMutation.mutateAsync(e.target.files[0]);
                  }
                }}
              />

              <div
                onClick={() => {
                  if (user?.avatarUrl) {
                    setAvatarLightboxOpen(true);
                  } else {
                    avatarInputRef.current?.click();
                  }
                }}
                className="cursor-pointer"
                title={user?.avatarUrl ? 'Click to view avatar' : 'Click to upload avatar'}
              >
                <UserAvatar
                  user={user}
                  size="4xl"
                  shape="square"
                  showStatus
                  status="online"
                  className="rounded-3xl border-4 border-card shadow-2xl overflow-hidden"
                />
              </div>

              {/* Hover actions overlay */}
              <div className="absolute inset-0 rounded-3xl bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-1.5 pointer-events-auto">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full shadow-md"
                  title="Change Avatar"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                >
                  <Camera className="w-3.5 h-3.5" />
                </Button>

                {user?.avatarUrl && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full shadow-md"
                    title="View Fullscreen"
                    onClick={() => setAvatarLightboxOpen(true)}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Title & Details */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {user?.name || 'TaskFlow User'}
                </h1>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {department}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {joinedDate}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Tasks
          </p>
          <h3 className="text-xl font-bold text-foreground">{stats.totalAssigned}</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Completed
          </p>
          <h3 className="text-xl font-bold text-emerald-500">{stats.completed}</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Rate
          </p>
          <h3 className="text-xl font-bold text-primary">{stats.completionRate}%</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Projects
          </p>
          <h3 className="text-xl font-bold text-foreground">{stats.projectCount}</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Boards
          </p>
          <h3 className="text-xl font-bold text-foreground">{stats.boardCount}</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Comments
          </p>
          <h3 className="text-xl font-bold text-foreground">{stats.totalComments}</h3>
        </div>

        <div className="p-3.5 rounded-2xl border border-border bg-card shadow-xs text-center space-y-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Files
          </p>
          <h3 className="text-xl font-bold text-foreground">{stats.totalAttachments}</h3>
        </div>
      </div>

      {/* Main Grid: Left About & Skills, Right Activity & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 col) */}
        <div className="space-y-6">
          {/* About Section */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" /> About
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {bio}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-border text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
                <span className="font-medium text-foreground">{phone}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </span>
                <span className="font-medium text-foreground">{location}</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Timezone
                </span>
                <span className="font-medium text-foreground">{timezone}</span>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Skills & Expertise
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-secondary text-foreground border border-border/80 flex items-center gap-1"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Settings Shortcuts */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Account & Security
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full p-2.5 rounded-xl hover:bg-secondary text-left text-xs font-semibold text-foreground flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-muted-foreground" /> Change Password
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <Link
                href="/settings/notifications"
                className="w-full p-2.5 rounded-xl hover:bg-secondary text-left text-xs font-semibold text-foreground flex items-center justify-between transition-colors block"
              >
                <span className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" /> Notification Preferences
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Projects */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-primary" /> Assigned Projects
              </h3>
              <Link href="/projects" className="text-xs text-primary hover:underline font-semibold">
                View All →
              </Link>
            </div>

            {isLoadingProjects ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No active projects assigned.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.slice(0, 4).map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all space-y-2 block"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {p.name}
                      </h4>
                      <Badge variant="outline" className="text-[10px]">
                        {p.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.description || 'No description provided.'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks List */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Recent Tasks
              </h3>
              <Link href="/tasks" className="text-xs text-primary hover:underline font-semibold">
                All Tasks →
              </Link>
            </div>

            {isLoadingTasks ? (
              <div className="space-y-2.5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : myTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No tasks assigned to your profile.
              </p>
            ) : (
              <div className="space-y-2">
                {myTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 flex items-center justify-between gap-3 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            task.priority === 'URGENT'
                              ? 'bg-rose-500'
                              : task.priority === 'HIGH'
                                ? 'bg-amber-500'
                                : 'bg-blue-500',
                          )}
                        />
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          {task.title}
                        </h5>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {task.dueDate
                          ? `Due ${new Date(task.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}`
                          : 'No due date'}
                      </span>
                    </div>

                    <Badge
                      variant={task.status === 'DONE' ? 'default' : 'secondary'}
                      className="text-[10px] shrink-0"
                    >
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Activity Timeline
            </h3>

            <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              <div className="relative space-y-0.5">
                <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                <p className="text-xs font-semibold text-foreground">
                  Joined workspace team
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Account created and verified
                </p>
              </div>

              {myTasks.slice(0, 3).map((task, idx) => (
                <div key={task.id} className="relative space-y-0.5">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                  <p className="text-xs font-semibold text-foreground">
                    Assigned to task &quot;{task.title}&quot;
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(task.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogHeader onClose={() => setShowEditProfile(false)}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your public profile, contact details, and technical expertise.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 overflow-y-auto max-h-[60vh] pr-1.5">
          <ImageUpload
            label="Profile Avatar"
            value={user?.avatarUrl}
            aspectRatio="avatar"
            onUpload={async (file) => {
              await uploadAvatarMutation.mutateAsync(file);
            }}
            onRemove={async () => {
              await removeAvatarMutation.mutateAsync();
            }}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Full Name</label>
            <Input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Department / Role</label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Engineering, Design, etc."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Tell colleagues about what you do"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Phone</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Skills (Press Enter to add)</label>
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={addSkill}
              placeholder="Type a skill and hit Enter..."
            />
            <div className="flex flex-wrap gap-1 pt-1.5">
              {skills.map((s) => (
                <span
                  key={s}
                  onClick={() => removeSkill(s)}
                  className="px-2 py-0.5 rounded-lg text-xs bg-secondary text-foreground border border-border cursor-pointer hover:bg-destructive/10 hover:text-destructive flex items-center gap-1"
                  title="Click to remove"
                >
                  {s} ✕
                </span>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditProfile(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </DialogFooter>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogHeader onClose={() => setShowChangePassword(false)}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Choose a strong password to protect your TaskFlow account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSavePassword} className="space-y-4 py-2 overflow-y-auto max-h-[60vh] pr-1.5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Current Password</label>
            <Input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">New Password</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangePassword(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Password</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) setSelectedTaskId(null);
        }}
      />

      {/* Avatar Fullscreen Lightbox */}
      {user?.avatarUrl && (
        <ImageLightbox
          open={avatarLightboxOpen}
          onClose={() => setAvatarLightboxOpen(false)}
          src={user.avatarUrl}
          title={`${user.name || 'User'}'s Profile Avatar`}
        />
      )}
    </div>
  );
}

