'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { toast } from 'sonner';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

interface AttachmentUploadZoneProps {
  taskId: number;
  onUploadSuccess?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AttachmentUploadZone({
  taskId,
  onUploadSuccess,
}: AttachmentUploadZoneProps) {
  const queryClient = useQueryClient();
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startUpload = useCallback(
    async (item: UploadQueueItem) => {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'uploading', progress: 0 } : q
        )
      );

      try {
        await taskService.uploadAttachment(taskId, item.file, (percent) => {
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, progress: percent } : q))
          );
        });

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id ? { ...q, status: 'completed', progress: 100 } : q
          )
        );

        void queryClient.invalidateQueries({ queryKey: ['attachments', taskId] });
        void queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
        void queryClient.invalidateQueries({ queryKey: ['boards'] });

        if (onUploadSuccess) onUploadSuccess();
        toast.success(`Uploaded ${item.file.name}`);

        // Automatically clean completed items after 4 seconds
        setTimeout(() => {
          setQueue((prev) => prev.filter((q) => q.id !== item.id));
        }, 4000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error', errorMessage: message }
              : q
          )
        );
        toast.error(`Failed to upload ${item.file.name}: ${message}`);
      }
    },
    [taskId, queryClient, onUploadSuccess]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newItems: UploadQueueItem[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        progress: 0,
        status: 'pending',
      }));

      setQueue((prev) => [...prev, ...newItems]);

      // Automatically start uploads
      newItems.forEach((item) => {
        void startUpload(item);
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [startUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleRetryItem = (item: UploadQueueItem) => {
    void startUpload(item);
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-border/80 hover:border-primary/50 hover:bg-secondary/30 bg-background/50'
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">
            Drop files here to upload, or{' '}
            <span className="text-primary hover:underline font-bold">browse</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Supports PDF, images, video, audio, code, and documents up to 25MB
          </p>
        </div>
      </div>

      {/* Upload Queue Progress */}
      {queue.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>Uploading Files ({queue.filter((q) => q.status === 'uploading').length} active)</span>
            {queue.some((q) => q.status === 'completed' || q.status === 'error') && (
              <button
                onClick={() => setQueue((prev) => prev.filter((q) => q.status === 'uploading'))}
                className="hover:text-foreground text-[10px]"
              >
                Clear finished
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl border border-border/70 bg-card text-xs flex flex-col gap-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <File className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ({formatBytes(item.file.size)})
                    </span>
                  </div>

                  {/* Actions / Status */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'completed' && (
                      <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    )}

                    {item.status === 'error' && (
                      <>
                        <button
                          onClick={() => handleRetryItem(item)}
                          className="p-1 rounded text-primary hover:bg-primary/10 transition-colors"
                          title="Retry Upload"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-destructive flex items-center gap-0.5 text-[11px] font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      </>
                    )}

                    {item.status === 'uploading' && (
                      <span className="text-[10px] font-semibold text-primary">
                        {item.progress}%
                      </span>
                    )}

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-150 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
