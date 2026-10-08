'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TaskAttachment } from '@/types/task';
import { taskService } from '@/services/task.service';
import { toast } from 'sonner';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  FileCode,
  FileSpreadsheet,
  File,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface AttachmentPreviewModalProps {
  attachment: TaskAttachment | null;
  allAttachments?: TaskAttachment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAttachment?: (att: TaskAttachment) => void;
}

type FileTypeCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'text'
  | 'office'
  | 'other';

function getFileCategory(fileName: string, mimeType?: string): FileTypeCategory {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const mime = mimeType?.toLowerCase() || '';

  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext) ||
    mime.startsWith('image/')
  ) {
    return 'image';
  }
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext) || mime.startsWith('video/')) {
    return 'video';
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext) || mime.startsWith('audio/')) {
    return 'audio';
  }
  if (
    [
      'txt',
      'json',
      'csv',
      'xml',
      'log',
      'md',
      'ts',
      'tsx',
      'js',
      'jsx',
      'html',
      'css',
      'yml',
      'yaml',
      'sql',
      'sh',
      'env',
    ].includes(ext) ||
    mime.startsWith('text/') ||
    mime === 'application/json'
  ) {
    return 'text';
  }
  if (
    ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext) ||
    mime.includes('spreadsheet') ||
    mime.includes('wordprocessing') ||
    mime.includes('presentation')
  ) {
    return 'office';
  }
  return 'other';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function AttachmentPreviewModal({
  attachment,
  allAttachments = [],
  open,
  onOpenChange,
  onSelectAttachment,
}: AttachmentPreviewModalProps) {
  const [loadedAttachmentId, setLoadedAttachmentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  // Viewer controls state
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [pdfPage, setPdfPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Derived loading state avoids cascading setState inside effect body
  const loading = Boolean(
    open &&
    attachment &&
    loadedAttachmentId !== attachment.id &&
    !error
  );

  // Navigation indices
  const currentIndex = attachment
    ? allAttachments.findIndex((a) => a.id === attachment.id)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < allAttachments.length - 1;

  const category = attachment
    ? getFileCategory(attachment.fileName, attachment.mimeType)
    : 'other';

  const handlePrev = useCallback(() => {
    if (hasPrev && onSelectAttachment && allAttachments[currentIndex - 1]) {
      onSelectAttachment(allAttachments[currentIndex - 1]);
    }
  }, [hasPrev, onSelectAttachment, allAttachments, currentIndex]);

  const handleNext = useCallback(() => {
    if (hasNext && onSelectAttachment && allAttachments[currentIndex + 1]) {
      onSelectAttachment(allAttachments[currentIndex + 1]);
    }
  }, [hasNext, onSelectAttachment, allAttachments, currentIndex]);

  // Fetch file content as blob with authentication
  useEffect(() => {
    if (!open || !attachment) {
      return;
    }

    let active = true;
    let currentBlobUrl: string | null = null;

    taskService
      .getAttachmentBlob(attachment.id)
      .then(async ({ blob }) => {
        if (!active) return;
        currentBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(currentBlobUrl);
        setLoadedAttachmentId(attachment.id);
        setError(null);
        setZoom(100);
        setRotation(0);
        setPdfPage(1);

        if (category === 'text') {
          try {
            const text = await blob.text();
            if (active) setTextContent(text);
          } catch {
            if (active) setTextContent('Unable to decode text content.');
          }
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        console.error('Failed to load attachment blob:', err);
        setError(err.message || 'Failed to load file preview');
        setLoadedAttachmentId(attachment.id);
      });

    return () => {
      active = false;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [attachment, open, category]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft' && hasPrev) {
        handlePrev();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPrev, hasNext, handlePrev, handleNext]);

  const handleDownload = async () => {
    if (!attachment) return;
    setIsDownloading(true);
    try {
      await taskService.downloadAttachment(attachment.id, attachment.fileName);
      toast.success(`Downloaded ${attachment.fileName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      toast.error(msg);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (!attachment) return;
    const viewUrl = taskService.getAttachmentViewUrl(attachment.id);
    navigator.clipboard.writeText(viewUrl);
    setIsCopied(true);
    toast.success('Direct link copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else if (attachment) {
      window.open(taskService.getAttachmentViewUrl(attachment.id), '_blank');
    }
  };

  const renderFileIcon = () => {
    switch (category) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-sky-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-emerald-500" />;
      case 'text':
        return <FileCode className="w-5 h-5 text-amber-500" />;
      case 'office':
        return <FileSpreadsheet className="w-5 h-5 text-teal-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (!open || !attachment) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-7xl w-[96vw] h-[92vh] max-h-[92vh] p-0 overflow-hidden flex flex-col rounded-2xl bg-background border-border shadow-2xl"
    >
      <div ref={containerRef} className="flex flex-col h-full w-full bg-background select-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-md shrink-0 gap-3">
          {/* File Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[40%]">
            <div className="p-2 rounded-xl bg-secondary shrink-0">
              {renderFileIcon()}
            </div>
            <div className="min-w-0 truncate">
              <h3 className="font-semibold text-sm text-foreground truncate" title={attachment.fileName}>
                {attachment.fileName}
              </h3>
              <p className="text-[11px] text-muted-foreground truncate">
                {formatBytes(attachment.fileSize)} •{' '}
                {attachment.uploader?.name || attachment.uploader?.email || 'Uploaded file'} •{' '}
                {new Date(attachment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Central Controls based on Category */}
          <div className="flex items-center gap-1.5 shrink-0 bg-secondary/50 px-2 py-1 rounded-xl border border-border/40">
            {category === 'pdf' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 p-0 rounded-lg text-xs"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 px-1 text-xs font-medium text-foreground">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    value={pdfPage}
                    onChange={(e) => setPdfPage(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-6 text-center text-xs rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPdfPage((p) => p + 1)}
                  className="h-7 w-7 p-0 rounded-lg text-xs"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="w-[1px] h-4 bg-border mx-1" />
              </>
            )}

            {(category === 'pdf' || category === 'image') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.max(25, z - 25))}
                  className="h-7 w-7 p-0 rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <span className="text-[11px] font-semibold px-1 min-w-[42px] text-center text-foreground">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoom((z) => Math.min(300, z + 25))}
                  className="h-7 w-7 p-0 rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setZoom(100);
                    setRotation(0);
                  }}
                  className="h-7 px-1.5 text-[11px] rounded-lg"
                  title="Reset Zoom"
                >
                  Reset
                </Button>
              </>
            )}

            {category === 'image' && (
              <>
                <div className="w-[1px] h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="h-7 w-7 p-0 rounded-lg"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Prev/Next File Navigation */}
            {allAttachments.length > 1 && (
              <div className="flex items-center gap-0.5 mr-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="h-8 w-8 p-0 rounded-lg"
                  title="Previous Attachment (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-[11px] text-muted-foreground px-1.5 font-medium">
                  {currentIndex + 1} / {allAttachments.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="h-8 w-8 p-0 rounded-lg"
                  title="Next Attachment (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-2.5 text-xs rounded-lg gap-1.5 font-medium"
              title="Copy direct link"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Copy Link</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="h-8 w-8 p-0 rounded-lg"
              title="Open in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              className="h-8 px-3 text-xs rounded-lg gap-1.5 font-medium shadow-xs"
              title="Download file to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Viewer Content Canvas */}
        <div className="flex-1 w-full h-[calc(100%-57px)] overflow-hidden bg-neutral-900/95 dark:bg-black relative flex items-center justify-center p-4">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-neutral-300">
              <Spinner size="lg" />
              <p className="text-xs font-medium tracking-wide">Loading secure preview...</p>
            </div>
          ) : error ? (
            <div className="max-w-md p-8 rounded-2xl bg-card border border-border text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base">Preview Unavailable</h4>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
                <p className="text-xs text-muted-foreground/80 mt-2">
                  You can still download this attachment directly to your device.
                </p>
              </div>
              <Button onClick={handleDownload} isLoading={isDownloading} className="w-full gap-2 text-xs">
                <Download className="w-4 h-4" /> Download Attachment
              </Button>
            </div>
          ) : !blobUrl ? null : (
            <>
              {/* PDF Viewer */}
              {category === 'pdf' && (
                <div
                  className="w-full h-full flex items-center justify-center overflow-auto transition-transform duration-150"
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                >
                  <iframe
                    src={`${blobUrl}#page=${pdfPage}&zoom=${zoom}`}
                    title={attachment.fileName}
                    className="w-full h-full rounded-lg border-0 shadow-2xl bg-white"
                  />
                </div>
              )}

              {/* Image Viewer */}
              {category === 'image' && (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blobUrl}
                    alt={attachment.fileName}
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Video Player */}
              {category === 'video' && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <video
                    src={blobUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full rounded-xl shadow-2xl bg-black border border-neutral-800"
                  />
                </div>
              )}

              {/* Audio Player */}
              {category === 'audio' && (
                <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border shadow-2xl text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Music className="w-10 h-10 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm truncate" title={attachment.fileName}>
                      {attachment.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(attachment.fileSize)}
                    </p>
                  </div>
                  <audio src={blobUrl} controls className="w-full rounded-lg shadow-xs" autoPlay />
                </div>
              )}

              {/* Text / Code Viewer */}
              {category === 'text' && (
                <div className="w-full h-full flex flex-col rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 text-neutral-200">
                  <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <span>{attachment.fileName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (textContent) {
                          navigator.clipboard.writeText(textContent);
                          toast.success('Text copied to clipboard');
                        }
                      }}
                      className="h-6 px-2 text-[11px] gap-1 hover:text-white"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed selection:bg-primary/30">
                    <pre className="whitespace-pre-wrap">{textContent || ''}</pre>
                  </div>
                </div>
              )}

              {/* Office Document Fallback Card */}
              {category === 'office' && (
                <div className="max-w-md p-8 rounded-2xl bg-card border border-border text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base truncate" title={attachment.fileName}>
                      {attachment.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(attachment.fileSize)} • Microsoft Office Document
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-3">
                      Native browser preview is not supported for Office files. Download to view in Microsoft Office or Google Docs.
                    </p>
                  </div>
                  <Button onClick={handleDownload} isLoading={isDownloading} className="w-full gap-2 text-xs">
                    <Download className="w-4 h-4" /> Download to View
                  </Button>
                </div>
              )}

              {/* Generic Fallback Card */}
              {category === 'other' && (
                <div className="max-w-md p-8 rounded-2xl bg-card border border-border text-center space-y-5 shadow-2xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <File className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base truncate" title={attachment.fileName}>
                      {attachment.fileName}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(attachment.fileSize)}
                    </p>
                    <p className="text-xs text-muted-foreground/80 mt-3">
                      Preview is unavailable for this file format. Please download the file to view on your device.
                    </p>
                  </div>
                  <Button onClick={handleDownload} isLoading={isDownloading} className="w-full gap-2 text-xs">
                    <Download className="w-4 h-4" /> Download File
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
