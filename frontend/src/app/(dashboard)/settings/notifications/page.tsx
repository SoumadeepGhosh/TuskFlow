'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '@/features/notification/hooks/use-notifications';
import {
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
} from '@/lib/browser-notification';
import { playNotificationSound } from '@/lib/notification-sound';
import {
  Bell,
  Check,
  Globe,
  Mail,
  MessageSquare,
  ShieldAlert,
  Volume2,
  UserCheck,
  AtSign,
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettingsPage() {
  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setBrowserPermission(getBrowserNotificationPermission());
  }, []);

  const handleToggle = (key: string, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  const handleRequestBrowserPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      toast.success('Desktop notification permission granted!');
      handleToggle('browserNotifications', true);
    } else if (perm === 'denied') {
      toast.error('Desktop notifications blocked in your browser settings.');
      handleToggle('browserNotifications', false);
    }
  };

  const handleTestSound = () => {
    playNotificationSound(0.6);
    toast('Sound Test', { description: 'Played notification chime' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-12">
        <PageHeader
          title="Notification Settings"
          description="Configure how and when you want to receive alerts and updates."
        />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card flex items-center justify-between"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-72" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const prefs = preferences || {
    emailNotifications: true,
    browserNotifications: true,
    soundEnabled: true,
    taskNotifications: true,
    commentNotifications: true,
    mentionNotifications: true,
    systemNotifications: true,
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <PageHeader
        title="Notification Settings"
        description="Configure your notification channels, sounds, and alerts for TaskFlow."
      />

      {/* Delivery Channels Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
          Delivery Channels
        </h3>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {/* Email Channel */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  Email Notifications
                </h4>
                <p className="text-xs text-muted-foreground">
                  Receive email alerts for task assignments and critical workspace invitations.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.emailNotifications}
                onChange={(e) =>
                  handleToggle('emailNotifications', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Desktop / Browser Notifications */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    Desktop Notifications
                  </h4>
                  {browserPermission === 'granted' ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 rounded">
                      Allowed
                    </span>
                  ) : browserPermission === 'denied' ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive rounded">
                      Blocked
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  Show notifications on your OS desktop even when the TaskFlow tab is inactive.
                </p>
                {browserPermission !== 'granted' && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-xs text-primary font-medium mt-1"
                    onClick={handleRequestBrowserPermission}
                  >
                    Enable Browser Permissions →
                  </Button>
                )}
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.browserNotifications && browserPermission === 'granted'}
                disabled={browserPermission !== 'granted'}
                onChange={(e) =>
                  handleToggle('browserNotifications', e.target.checked)
                }
                className="sr-only peer disabled:opacity-50"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Sound Chimes */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  Audio Chime
                </h4>
                <p className="text-xs text-muted-foreground">
                  Play an elegant gentle sound chime when new realtime notifications arrive.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground font-medium mt-1"
                  onClick={handleTestSound}
                >
                  Play Test Sound ♫
                </Button>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.soundEnabled}
                onChange={(e) =>
                  handleToggle('soundEnabled', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Activity Preferences Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground">
          Activity Preferences
        </h3>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
          {/* Task Notifications */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  Task Assignments & Status Changes
                </h4>
                <p className="text-xs text-muted-foreground">
                  When a task is assigned to you, updated, completed, or reopened.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.taskNotifications}
                onChange={(e) =>
                  handleToggle('taskNotifications', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Comment Notifications */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  Comments & Discussions
                </h4>
                <p className="text-xs text-muted-foreground">
                  When team members post comments on tasks where you are an assignee or reporter.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.commentNotifications}
                onChange={(e) =>
                  handleToggle('commentNotifications', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Mentions */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
                <AtSign className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  Direct Mentions
                </h4>
                <p className="text-xs text-muted-foreground">
                  When someone specifically mentions you (@username) in a description or comment.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.mentionNotifications}
                onChange={(e) =>
                  handleToggle('mentionNotifications', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* System & Security */}
          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-foreground">
                  System & Workspace Security
                </h4>
                <p className="text-xs text-muted-foreground">
                  Workspace invites, role changes, and account security notifications.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={prefs.systemNotifications}
                onChange={(e) =>
                  handleToggle('systemNotifications', e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

