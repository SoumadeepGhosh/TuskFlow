import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 selection:bg-accent selection:text-primary">
      {/* Subtle top ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl">
        <div className="aspect-[1155/678] w-[68rem] flex-none bg-gradient-to-tr from-[#5B5CEB]/10 to-[#8C8DF7]/15 opacity-60" />
      </div>

      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="4" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Task<span className="text-primary">Flow</span>
          </span>
        </Link>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TaskFlow Inc. Modern Kanban Engineering.</p>
      </div>
    </div>
  );
}
