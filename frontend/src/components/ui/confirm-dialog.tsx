'use client';

import React from 'react';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Spinner } from './spinner';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isPending?: boolean;
  variant?: 'destructive' | 'default';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmText,
  cancelLabel = 'Cancel',
  onConfirm,
  isPending = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const finalConfirmLabel = confirmText ?? confirmLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader onClose={() => onOpenChange(false)}>
        <div className="flex items-center gap-2.5">
          {variant === 'destructive' && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <DialogTitle>{title}</DialogTitle>
        </div>
      </DialogHeader>

      <DialogDescription className="py-2 text-foreground/80">
        {description}
      </DialogDescription>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant}
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" className="text-white" />
              Processing...
            </span>
          ) : (
            finalConfirmLabel
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

