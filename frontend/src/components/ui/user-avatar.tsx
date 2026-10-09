'use client';

import React, { useState } from 'react';
import { getAssetUrl, getAvatarColor, getInitials } from '@/lib/assets';
import { cn } from '@/lib/utils';

export type UserAvatarSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export interface UserAvatarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  shape?: 'circle' | 'square';
  showStatus?: boolean;
  status?: 'online' | 'busy' | 'away' | 'offline';
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeClasses: Record<UserAvatarSize, { container: string; text: string; dot: string }> = {
  xs: { container: 'w-5 h-5', text: 'text-[9px] font-bold', dot: 'w-1.5 h-1.5' },
  sm: { container: 'w-6 h-6', text: 'text-[10px] font-bold', dot: 'w-2 h-2' },
  md: { container: 'w-8 h-8', text: 'text-xs font-semibold', dot: 'w-2.5 h-2.5' },
  lg: { container: 'w-10 h-10', text: 'text-sm font-semibold', dot: 'w-3 h-3' },
  xl: { container: 'w-12 h-12', text: 'text-base font-bold', dot: 'w-3.5 h-3.5' },
  '2xl': { container: 'w-16 h-16', text: 'text-xl font-bold', dot: 'w-4 h-4' },
  '3xl': { container: 'w-24 h-24', text: 'text-3xl font-extrabold', dot: 'w-5 h-5' },
  '4xl': { container: 'w-28 h-28', text: 'text-4xl font-black', dot: 'w-6 h-6' },
};

const statusColors: Record<'online' | 'busy' | 'away' | 'offline', string> = {
  online: 'bg-emerald-500',
  busy: 'bg-rose-500',
  away: 'bg-amber-500',
  offline: 'bg-slate-400',
};

export function UserAvatar({
  user,
  name,
  email,
  avatarUrl,
  size = 'md',
  shape = 'circle',
  showStatus = false,
  status = 'online',
  className,
  onClick,
  title,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const effectiveName = name ?? user?.name ?? '';
  const effectiveEmail = email ?? user?.email ?? '';
  const effectiveAvatar = avatarUrl ?? user?.avatarUrl ?? null;
  const resolvedUrl = getAssetUrl(effectiveAvatar);

  const initials = getInitials(effectiveName || effectiveEmail);
  const color = getAvatarColor(effectiveName || effectiveEmail);
  const sizeConfig = sizeClasses[size];

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const tooltipText = title ?? (effectiveName ? `${effectiveName} (${effectiveEmail})` : effectiveEmail);

  return (
    <div
      onClick={onClick}
      title={tooltipText}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center font-medium transition-transform',
        sizeConfig.container,
        onClick && 'cursor-pointer hover:scale-105 active:scale-95',
        className,
      )}
    >
      {resolvedUrl && !imageError ? (
        <img
          src={resolvedUrl}
          alt={effectiveName || 'User Avatar'}
          onError={() => setImageError(true)}
          className={cn(
            'w-full h-full object-cover shadow-xs border border-border/80',
            roundedClass,
          )}
          loading="lazy"
        />
      ) : (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center shadow-xs border',
            color.bg,
            color.text,
            color.border,
            sizeConfig.text,
            roundedClass,
          )}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background ring-1 ring-border/50',
            sizeConfig.dot,
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}

