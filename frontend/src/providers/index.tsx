'use client';

import React from 'react';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';
import { SocketProvider } from './socket-provider';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: '14px',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
