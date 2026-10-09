'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import { tokenStorage } from '@/lib/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Notification } from '@/types/notification';
import { playNotificationSound } from '@/lib/notification-sound';
import { showBrowserNotification } from '@/lib/browser-notification';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!user || !token) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setSocket(null);
      setIsConnected(false);
    });

    // Realtime notification event
    newSocket.on('notification', (payload: Notification) => {
      // 1. Play pleasant audio chime
      try {
        playNotificationSound();
      } catch {
        // audio playback restricted
      }

      // 2. Desktop notification if tab is in background
      try {
        if (typeof document !== 'undefined' && document.hidden) {
          showBrowserNotification(payload.title || 'TaskFlow Notification', {
            body: payload.message,
            onClick: () => {
              if (payload.actionUrl) {
                window.location.href = payload.actionUrl;
              }
            },
          });
        }
      } catch {
        // desktop notification fallback
      }

      // 3. In-app toast
      toast(payload.title || 'New Notification', {
        description: payload.message,
      });

      // 4. Automatically invalidate queries so UI updates immediately without manual reload
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, queryClient]);

  const activeSocket = user ? socket : null;
  const activeIsConnected = user ? isConnected : false;

  return (
    <SocketContext.Provider
      value={{ socket: activeSocket, isConnected: activeIsConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
