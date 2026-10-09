/**
 * Browser Notification API Manager
 * Manages native desktop notifications when TaskFlow tab is in background.
 */

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getBrowserNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) return 'denied';
  return Notification.permission;
}

export function showBrowserNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  },
): void {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || '/favicon.ico',
      tag: options?.tag,
    });

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      notification.close();
      if (options?.onClick) {
        options.onClick();
      }
    };
  } catch {
    // Silent fail if browser blocks background notifications
  }
}

