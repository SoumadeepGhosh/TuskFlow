'use client';

import React, { useState, useRef, useCallback } from 'react';
import { getAssetUrl } from '@/lib/assets';
import { Button } from './button';
import { ImageLightbox } from './image-lightbox';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Loader2,
  Check,
  Crop as CropIcon,
  Sliders,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  onUpload: (file: File) => Promise<void | string>;
  onRemove?: () => Promise<void>;
  aspectRatio?: 'avatar' | 'banner' | 'logo';
  label?: string;
  helperText?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

const ALLOWED_EXTENSIONS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];

export function ImageUpload({
  value,
  onUpload,
  onRemove,
  aspectRatio = 'avatar',
  label,
  helperText,
  maxSizeMB = 10,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Quick crop/zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = useCallback(
    async (file: File) => {
      // 1. Validate MIME type
      if (!ALLOWED_EXTENSIONS.includes(file.type)) {
        toast.error('Invalid image type. Please upload a JPG, PNG, WEBP, or SVG file.');
        return;
      }

      // 2. Validate Size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File exceeds ${maxSizeMB}MB maximum limit.`);
        return;
      }

      // 3. Local object URL preview
      const localUrl = URL.createObjectURL(file);
      setPreviewSrc(localUrl);
      setIsUploading(true);
      setUploadProgress(15);

      try {
        const interval = setInterval(() => {
          setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
        }, 150);

        await onUpload(file);
        clearInterval(interval);
        setUploadProgress(100);
        toast.success('Image uploaded successfully');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        toast.error(`Failed to upload image: ${msg}`);
        setPreviewSrc(null);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [maxSizeMB, onUpload],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;
    try {
      setIsUploading(true);
      await onRemove();
      setPreviewSrc(null);
      toast.success('Image removed successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Remove failed';
      toast.error(`Failed to remove image: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const currentImageUrl = previewSrc || (value ? getAssetUrl(value) : null);

  const aspectClass =
    aspectRatio === 'avatar'
      ? 'w-28 h-28 rounded-full'
      : aspectRatio === 'logo'
      ? 'w-24 h-24 rounded-2xl'
      : 'w-full h-40 sm:h-48 rounded-2xl';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Max {maxSizeMB}MB • JPG, PNG, WEBP, SVG
          </span>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {currentImageUrl ? (
        <div className="space-y-3">
          {/* Active Preview Box */}
          <div
            className={cn(
              'relative group overflow-hidden border border-border bg-muted/30 shadow-xs flex items-center justify-center',
              aspectClass,
            )}
          >
            <img
              src={currentImageUrl}
              alt={label || 'Uploaded preview'}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.1s ease-out',
              }}
              className={cn(
                'object-cover w-full h-full',
                aspectRatio === 'avatar' ? 'rounded-full' : 'rounded-2xl',
              )}
            />

            {/* Overlay Action Buttons */}
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shadow-md"
                title="Preview Fullscreen"
                onClick={() => setLightboxOpen(true)}
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 rounded-full shadow-md"
                title="Replace Image"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>

              {onRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full shadow-md"
                  title="Remove Image"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Uploading Spinner */}
            {isUploading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-[11px] font-semibold text-foreground">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="text-xs h-7 px-2.5 font-medium"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" /> Replace
              </Button>

              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled || isUploading}
                  className="text-xs h-7 px-2.5 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3 h-3 mr-1.5" /> Remove
                </Button>
              )}
            </div>

            {/* Quick Zoom Slider toggle */}
            <button
              type="button"
              onClick={() => setIsAdjusting((prev) => !prev)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
            >
              <Sliders className="w-3 h-3" /> Fit & Zoom
            </button>
          </div>

          {/* Quick Fit & Zoom Slider */}
          {isAdjusting && (
            <div className="p-2.5 rounded-xl border border-border bg-secondary/30 flex items-center gap-3 animate-in fade-in-0 duration-100">
              <span className="text-[11px] font-semibold text-muted-foreground">Zoom:</span>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 bg-border rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-medium text-foreground w-10 text-right">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setZoomLevel(1)}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Dropzone Box when no image */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all',
            isDragOver
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/20 bg-card',
            disabled && 'pointer-events-none opacity-50',
            aspectRatio === 'banner' && 'min-h-[140px]',
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-semibold text-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary shadow-xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {helperText || `JPG, PNG, WEBP or SVG up to ${maxSizeMB}MB`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {currentImageUrl && (
        <ImageLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          src={currentImageUrl}
          title={label || 'Image Preview'}
        />
      )}
    </div>
  );
}

