'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/features/notification/hooks/use-notifications';
import { NotificationType } from '@/types/notification';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, isError } = useNotifications(page, 15);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const allItems = data?.items || [];
  const filteredItems =
    filter === 'unread' ? allItems.filter((n) => !n.isRead) : allItems;
  const unreadCount = allItems.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'WORKSPACE_INVITE':
      case 'PROJECT_INVITE':
        return <UserPlus className="w-4 h-4 text-primary" />;
      case 'TASK_COMMENT':
        return <MessageSquare className="w-4 h-4 text-info" />;
      case 'TASK_STATUS_CHANGED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'TASK_DUE_SOON':
      case 'TASK_OVERDUE':
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Notifications"
          description="Stay updated with activities, assignments, and discussions across your teams."
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all',
            filter === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all',
            filter === 'unread'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Unread
          {unreadCount > 0 && (
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                filter === 'unread'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-destructive">
          Failed to load notifications. Please try again.
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'You have read all of your recent notifications.'
              : 'When someone assigns you a task or comments, you will see it here.'
          }
        />
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'group p-4 rounded-2xl border transition-all flex items-start justify-between gap-4',
                notification.isRead
                  ? 'bg-card/70 border-border/80 text-card-foreground'
                  : 'bg-primary/5 border-primary/20 text-foreground shadow-xs'
              )}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    notification.isRead ? 'bg-secondary' : 'bg-background shadow-xs border border-primary/20'
                  )}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80">
                    {new Date(notification.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 shrink-0">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markReadMutation.mutate(notification.id)}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(notification.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>
                Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.meta.page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

