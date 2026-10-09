'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  useInfiniteNotifications,
  useUnreadCount,
  useMarkAllNotificationsRead,
  useClearAllNotifications,
  useBulkNotificationAction,
} from '../hooks/use-notifications';
import {
  NotificationCard,
} from './notification-card';
import {
  Notification,
  NotificationStatusFilter,
  NotificationType,
} from '@/types/notification';
import {
  Bell,
  CheckCheck,
  CheckSquare,
  Filter,
  Loader2,
  Search,
  Settings,
  Square,
  Trash2,
  X,
  Archive,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount ?? 0;

  // Build query params based on active tab
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
      status,
      entityType,
      type,
      search: searchQuery.trim() || undefined,
      limit: 20,
    };
  }, [activeTab, searchQuery]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteNotifications(queryParams);

  const markAllReadMutation = useMarkAllNotificationsRead();
  const clearAllMutation = useClearAllNotifications();
  const bulkActionMutation = useBulkNotificationAction();

  // Flatten infinite query pages
  const allNotifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(allNotifications);
  }, [allNotifications]);

  // Handle outside click to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const selectAllVisible = () => {
    if (selectedIds.length === allNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allNotifications.map((n) => n.id));
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
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle notification center"
        className={cn(
          'relative rounded-full transition-all text-muted-foreground hover:text-foreground',
          isOpen && 'bg-accent text-foreground',
        )}
      >
        <Bell className="h-4.5 w-4.5" />

        {/* Live Unread Badge */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            {/* Animated Ping Ring */}
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-primary/40 animate-ping pointer-events-none" />
          </>
        )}
      </Button>

      {/* Popover Dropdown Window */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[440px] md:w-[480px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-border bg-card/95 backdrop-blur-md sticky top-0 z-10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground tracking-tight">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Bulk Select Toggle */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setIsBulkMode((prev) => !prev);
                    setSelectedIds([]);
                  }}
                  title={isBulkMode ? 'Exit select mode' : 'Select multiple'}
                  className={cn(
                    'h-7 w-7 text-muted-foreground hover:text-foreground',
                    isBulkMode && 'bg-accent text-primary',
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </Button>

                {/* Mark All Read */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => markAllReadMutation.mutate()}
                  disabled={unreadCount === 0 || markAllReadMutation.isPending}
                  title="Mark all as read"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </Button>

                {/* Preferences */}
                <Link href="/settings/notifications" onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Notification settings"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by title, actor, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-xl bg-secondary/80 border border-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border focus:bg-card transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 text-xs">
              {[
                { id: 'all', label: 'All' },
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
                    setSelectedIds([]);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bulk Toolbar */}
            {isBulkMode && (
              <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                <button
                  onClick={selectAllVisible}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium"
                >
                  {selectedIds.length === allNotifications.length &&
                  allNotifications.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>
                    Select All ({selectedIds.length}/{allNotifications.length})
                  </span>
                </button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    disabled={selectedIds.length === 0}
                    onClick={() => handleBulkAction('read')}
                  >
                    Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    disabled={selectedIds.length === 0}
                    onClick={() => handleBulkAction('archive')}
                  >
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-destructive hover:bg-destructive/10"
                    disabled={selectedIds.length === 0}
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Notification List */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-[260px] max-h-[460px]"
          >
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-border bg-card flex items-start gap-3"
                  >
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-2.5 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground mb-3">
                  <Bell className="w-5 h-5 opacity-60" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  {searchQuery
                    ? 'No matching notifications'
                    : activeTab === 'unread'
                      ? 'You are all caught up!'
                      : activeTab === 'archived'
                        ? 'No archived notifications'
                        : 'No notifications yet'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  {searchQuery
                    ? 'Try searching with different keywords.'
                    : activeTab === 'unread'
                      ? 'No unread updates in your inbox right now.'
                      : 'Activity on your tasks, projects, and comments will show up here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedNotifications.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <div className="sticky top-0 bg-card/90 backdrop-blur-xs py-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 z-5">
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
                          onCloseParent={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Infinite Scroll Trigger */}
                {hasNextPage && (
                  <div className="pt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="w-full text-xs"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                          Loading more...
                        </>
                      ) : (
                        'Load more notifications'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-secondary/30 flex items-center justify-between text-xs">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-primary hover:underline font-semibold"
            >
              Open Full Inbox →
            </Link>

            <button
              onClick={() => clearAllMutation.mutate()}
              disabled={allNotifications.length === 0 || clearAllMutation.isPending}
              className="text-muted-foreground hover:text-destructive text-[11px] transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
