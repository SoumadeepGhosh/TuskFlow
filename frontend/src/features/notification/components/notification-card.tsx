'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Notification,
  NotificationType,
} from '@/types/notification';
import {
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useArchiveNotification,
  useRestoreNotification,
  useDeleteNotification,
} from '../hooks/use-notifications';
import {
  Archive,
  ArchiveRestore,
  Bell,
  Check,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  RotateCcw,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/ui/user-avatar';

interface NotificationCardProps {
  notification: Notification;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
  showSelectCheckbox?: boolean;
  onCloseParent?: () => void;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getNotificationBadge(type: NotificationType) {
  switch (type) {
    case 'TASK_ASSIGNED':
      return {
        icon: UserCheck,
        color: 'text-primary bg-primary/10 border-primary/20',
        label: 'Task Assigned',
      };
    case 'TASK_COMMENT':
    case 'COMMENT_ADDED':
      return {
        icon: MessageSquare,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        label: 'Comment',
      };
    case 'TASK_COMPLETED':
      return {
        icon: CheckCircle,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        label: 'Completed',
      };
    case 'TASK_STATUS_CHANGED':
      return {
        icon: TrendingUp,
        color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
        label: 'Status Changed',
      };
    case 'TASK_PRIORITY_CHANGED':
      return {
        icon: Tag,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        label: 'Priority Changed',
      };
    case 'TASK_REOPENED':
      return {
        icon: RotateCcw,
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        label: 'Reopened',
      };
    case 'TASK_DUE':
      return {
        icon: Clock,
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        label: 'Due Soon',
      };
    case 'WORKSPACE_INVITE':
      return {
        icon: Users,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
        label: 'Workspace',
      };
    case 'USER_MENTIONED':
      return {
        icon: UserPlus,
        color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
        label: 'Mentioned',
      };
    case 'SECURITY':
      return {
        icon: Shield,
        color: 'text-red-500 bg-red-500/10 border-red-500/20',
        label: 'Security',
      };
    case 'EMAIL':
      return {
        icon: Mail,
        color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
        label: 'Email',
      };
    default:
      return {
        icon: Bell,
        color: 'text-primary bg-primary/10 border-primary/20',
        label: 'Notification',
      };
  }
}

export function NotificationCard({
  notification,
  isSelected = false,
  onSelect,
  showSelectCheckbox = false,
  onCloseParent,
}: NotificationCardProps) {
  const router = useRouter();
  const markReadMutation = useMarkNotificationRead();
  const markUnreadMutation = useMarkNotificationUnread();
  const archiveMutation = useArchiveNotification();
  const restoreMutation = useRestoreNotification();
  const deleteMutation = useDeleteNotification();

  const badge = getNotificationBadge(notification.type);
  const Icon = badge.icon;
  const isArchived = Boolean(notification.archivedAt);

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      if (onCloseParent) onCloseParent();
      router.push(notification.actionUrl);
    }
  };

  const senderName = notification.sender?.name || 'System';
  const senderInitial = senderName.charAt(0).toUpperCase();

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none text-left flex items-start gap-3',
        notification.isRead
          ? 'bg-card/60 hover:bg-card border-border/70 hover:border-border text-card-foreground'
          : 'bg-primary/[0.04] hover:bg-primary/[0.08] border-primary/20 text-foreground shadow-xs',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/[0.08]',
      )}
    >
      {/* Checkbox for bulk actions */}
      {showSelectCheckbox && (
        <div
          className="pt-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (onSelect) onSelect(notification.id);
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
          />
        </div>
      )}

      {/* Avatar or Type Icon */}
      <div className="relative shrink-0 mt-0.5">
        <UserAvatar user={notification.sender} size="md" />

        {/* Small Type Icon Badge */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 p-0.5 rounded-full border shadow-xs',
            badge.color,
          )}
          title={badge.label}
        >
          <Icon className="w-3 h-3" />
        </div>
      </div>

      {/* Notification Body */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-foreground truncate max-w-[180px]">
            {senderName}
          </span>
          <span className="text-[11px] text-muted-foreground/60">•</span>
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {!notification.isRead && (
            <span
              className="w-2 h-2 rounded-full bg-primary shrink-0 ml-auto"
              title="Unread"
            />
          )}
        </div>

        <h4 className="text-xs sm:text-sm font-medium text-foreground mt-0.5 leading-snug line-clamp-1">
          {notification.title}
        </h4>

        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>

        {notification.actionUrl && (
          <div className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-primary hover:underline">
            <span>View details</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Hover Action Buttons */}
      <div
        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 self-center"
        onClick={(e) => e.stopPropagation()}
      >
        {notification.isRead ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => markUnreadMutation.mutate(notification.id)}
            title="Mark as unread"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => markReadMutation.mutate(notification.id)}
            title="Mark as read"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
        )}

        {isArchived ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => restoreMutation.mutate(notification.id)}
            title="Restore from archive"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <ArchiveRestore className="w-3.5 h-3.5" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => archiveMutation.mutate(notification.id)}
            title="Archive"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Archive className="w-3.5 h-3.5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => deleteMutation.mutate(notification.id)}
          title="Delete"
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
