import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg';
}

export function Spinner({ className, size = 'default', ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <div
      role="status"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
