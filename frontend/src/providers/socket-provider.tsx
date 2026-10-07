'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import { tokenStorage } from '@/lib/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Notification } from '@/types/notification';

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
      toast(payload.title || 'New Notification', {
        description: payload.message,
      });

      // Automatically invalidate queries so UI updates immediately without manual reload
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
