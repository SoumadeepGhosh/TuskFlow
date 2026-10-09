'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
  useBulkNotificationAction,
} from '@/features/notification/hooks/use-notifications';
import {
  NotificationCard,
} from '@/features/notification/components/notification-card';
import {
  Notification,
  NotificationStatusFilter,
  NotificationType,
} from '@/types/notification';
import {
  Bell,
  CheckCheck,
  CheckSquare,
  Search,
  Settings,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'unread' | 'tasks' | 'comments' | 'mentions' | 'archived';

interface DateGroup {
  label: string;
  items: Notification[];
}

function groupNotificationsByDate(items: Notification[]): DateGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'Last Week': [],
    Older: [],
  };

  items.forEach((item) => {
    const itemDate = new Date(item.createdAt);
    if (itemDate >= today) {
      groups.Today.push(item);
    } else if (itemDate >= yesterday) {
      groups.Yesterday.push(item);
    } else if (itemDate >= lastWeek) {
      groups['Last Week'].push(item);
    } else {
      groups.Older.push(item);
    }
  });

  return [
    { label: 'Today', items: groups.Today },
    { label: 'Yesterday', items: groups.Yesterday },
    { label: 'Last Week', items: groups['Last Week'] },
    { label: 'Older', items: groups.Older },
  ].filter((g) => g.items.length > 0);
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Build query
  const queryParams = useMemo(() => {
    let status: NotificationStatusFilter = 'all';
    let entityType: string | undefined = undefined;
    let type: NotificationType | undefined = undefined;

    if (activeTab === 'unread') {
      status = 'unread';
    } else if (activeTab === 'archived') {
      status = 'archived';
    } else if (activeTab === 'tasks') {
      entityType = 'task';
    } else if (activeTab === 'comments') {
      type = 'TASK_COMMENT';
    } else if (activeTab === 'mentions') {
      type = 'USER_MENTIONED';
    }

    return {
      page,
      limit: 20,
      status,
      entityType,
      type,
      search: searchQuery.trim() || undefined,
    };
  }, [page, activeTab, searchQuery]);

  const { data, isLoading, isError } = useNotifications(queryParams);
  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearAllMutation = useClearAllNotifications();
  const bulkActionMutation = useBulkNotificationAction();

  const allItems = data?.items || [];
  const meta = data?.meta;

  const grouped = useMemo(() => {
    return groupNotificationsByDate(allItems);
  }, [allItems]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === allItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allItems.map((n) => n.id));
    }
  };

  const handleBulkAction = (action: 'read' | 'unread' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) return;
    bulkActionMutation.mutate(
      { action, ids: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setIsBulkMode(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Notification Inbox"
          description="Centralized hub for updates, discussions, assignments, and activities across your workspaces."
        />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsBulkMode((prev) => !prev);
              setSelectedIds([]);
            }}
            className={cn(isBulkMode && 'bg-accent text-primary')}
          >
            <CheckSquare className="w-4 h-4 mr-1.5" />
            {isBulkMode ? 'Done Selecting' : 'Select'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || allItems.length === 0}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All as Read
          </Button>

          <Link href="/settings/notifications">
            <Button variant="ghost" size="icon-sm" title="Notification Preferences">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar & Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search notifications by title, sender, or content..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 border-b border-border">
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'unread', label: 'Unread' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'comments', label: 'Comments' },
            { id: 'mentions', label: 'Mentions' },
            { id: 'archived', label: 'Archived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as FilterTab);
                setPage(1);
                setSelectedIds([]);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {isBulkMode && (
        <div className="p-3 rounded-xl bg-secondary/80 border border-border flex items-center justify-between gap-4 animate-in fade-in-0 duration-150">
          <button
            onClick={selectAllVisible}
            className="flex items-center gap-2 text-xs font-medium text-foreground"
          >
            {selectedIds.length === allItems.length && allItems.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
            <span>
              Select All Visible ({selectedIds.length}/{allItems.length})
            </span>
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkAction('read')}
            >
              Mark Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkAction('unread')}
            >
              Mark Unread
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkAction('archive')}
            >
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              disabled={selectedIds.length === 0}
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card flex items-start gap-3.5"
            >
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3.5 w-72" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-12 text-center text-sm text-destructive">
          Failed to load notifications. Please check your connection and try again.
        </div>
      ) : allItems.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            searchQuery
              ? 'No matching notifications found'
              : activeTab === 'unread'
                ? 'All caught up!'
                : activeTab === 'archived'
                  ? 'No archived notifications'
                  : 'No notifications in your inbox'
          }
          description={
            searchQuery
              ? 'Try modifying your search terms.'
              : activeTab === 'unread'
                ? 'You have responded to or read all recent updates.'
                : 'Assignments, comments, and project activities will appear here in real time.'
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label} className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 px-1">
                {group.label}
              </div>

              <div className="space-y-2">
                {group.items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedIds.includes(notification.id)}
                    onSelect={toggleSelect}
                    showSelectCheckbox={isBulkMode}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
              <span>
                Page {meta.page} of {meta.totalPages} ({meta.total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
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
