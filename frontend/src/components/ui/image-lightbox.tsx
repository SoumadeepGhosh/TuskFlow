'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAssetUrl } from '@/lib/assets';
import { Button } from './button';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCcw,
} from 'lucide-react';

export interface LightboxImage {
  src: string;
  title?: string;
  alt?: string;
}

export interface ImageLightboxProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  src?: string;
  title?: string;
  alt?: string;
  images?: LightboxImage[];
  initialIndex?: number;
}

export function ImageLightbox({
  open,
  isOpen,
  onClose,
  src,
  title,
  alt,
  images = [],
  initialIndex = 0,
}: ImageLightboxProps) {
  const isModalOpen = open ?? isOpen ?? false;
  // Normalize images list
  const allImages: LightboxImage[] =
    images.length > 0
      ? images
      : src
      ? [{ src, title, alt }]
      : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isModalOpen, initialIndex]);

  const currentImage = allImages[currentIndex];
  const hasMultiple = allImages.length > 1;

  const handleNext = useCallback(() => {
    if (hasMultiple) {
      setCurrentIndex((prev) => (prev + 1) % allImages.length);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [hasMultiple, allImages.length]);

  const handlePrev = useCallback(() => {
    if (hasMultiple) {
      setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [hasMultiple, allImages.length]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const resolved = getAssetUrl(currentImage.src);
    const link = document.createElement('a');
    link.href = resolved;
    link.download = currentImage.title || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, onClose, handleNext, handlePrev]);

  // Mouse pan handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isModalOpen || !currentImage) return null;

  const resolvedSrc = getAssetUrl(currentImage.src);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-in fade-in-0 duration-150 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-foreground truncate max-w-md">
            {currentImage.title || 'Image Preview'}
          </p>
          {hasMultiple && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {currentIndex + 1} / {allImages.length}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
            {Math.round(zoom * 100)}% {rotation > 0 && `• ${rotation}°`}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            title="Reset (0)"
            className="h-8 w-8 p-0"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            title="Rotate (R)"
            className="h-8 w-8 p-0"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            title="Download"
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="h-8 w-8 p-0 hidden sm:inline-flex"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>

          <div className="w-px h-5 bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            title="Close (Esc)"
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center p-4 cursor-default"
        onMouseDown={handleMouseDown}
      >
        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-card/80 hover:bg-card border border-border text-foreground backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Previous (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-card/80 hover:bg-card border border-border text-foreground backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Next (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* The Image Element */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          <img
            src={resolvedSrc}
            alt={currentImage.alt || currentImage.title || 'Image Preview'}
            className="max-h-[80vh] max-w-[88vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip (if multiple) */}
      {hasMultiple && (
        <div className="px-6 py-3 border-t border-border/60 bg-card/30 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setZoom(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
              }}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === currentIndex
                  ? 'border-primary ring-2 ring-primary/30 scale-105'
                  : 'border-border/60 opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={getAssetUrl(img.src)}
                alt={img.title || `Thumb ${idx}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

