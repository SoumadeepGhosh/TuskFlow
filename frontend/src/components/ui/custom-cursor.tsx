'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [hoverState, setHoverState] = useState<{
    isHovered: boolean;
    type: 'link' | 'button' | 'text' | 'code' | 'drag' | 'default';
    label?: string;
  }>({
    isHovered: false,
    type: 'default',
  });

  // Coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop with fine pointer
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Check element under cursor
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, [role="button"], input, textarea, select, pre, code, [data-cursor]');
      if (interactive) {
        const tagName = interactive.tagName.toLowerCase();
        const customLabel = interactive.getAttribute('data-cursor');

        if (customLabel) {
          setHoverState({ isHovered: true, type: 'button', label: customLabel });
        } else if (tagName === 'button' || interactive.getAttribute('role') === 'button') {
          setHoverState({ isHovered: true, type: 'button', label: 'CLICK' });
        } else if (tagName === 'a') {
          setHoverState({ isHovered: true, type: 'link', label: 'EXPLORE ↗' });
        } else if (tagName === 'pre' || tagName === 'code') {
          setHoverState({ isHovered: true, type: 'code', label: 'COPY' });
        } else if (['input', 'textarea'].includes(tagName)) {
          setHoverState({ isHovered: true, type: 'text' });
        } else {
          setHoverState({ isHovered: true, type: 'default' });
        }
      } else {
        setHoverState({ isHovered: false, type: 'default' });
      }
    };

    const onMouseDown = () => setClicking(true);
    const onMouseUp = () => setClicking(false);
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth lerp loop for the outer reticle
    const render = () => {
      // Lerp ring towards mouse
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [visible]);

  if (!mounted || !visible) return null;

  const isInteractive = hoverState.isHovered;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
      {/* Precision Center Reticle Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[4px] -mt-[4px] pointer-events-none z-[10000] will-change-transform"
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            clicking
              ? 'w-3 h-3 -translate-x-[2px] -translate-y-[2px] bg-primary ring-4 ring-primary/30'
              : isInteractive
              ? 'w-2.5 h-2.5 -translate-x-[1px] -translate-y-[1px] bg-primary'
              : 'w-2 h-2 bg-primary shadow-[0_0_8px_rgba(53,37,205,0.6)]'
          }`}
        />
      </div>

      {/* Trailing Precision Target Ring with Reticle Ticks & Context Pill */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
      >
        <div
          className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
            isInteractive
              ? 'w-12 h-12 -ml-6 -mt-6'
              : clicking
              ? 'w-7 h-7 -ml-3.5 -mt-3.5'
              : 'w-8 h-8 -ml-4 -mt-4'
          }`}
        >
          {/* Main Reticle Outer Ring */}
          <div
            className={`absolute inset-0 rounded-full border transition-all duration-300 ${
              isInteractive
                ? 'border-primary/60 bg-primary/10 shadow-[0_0_15px_rgba(53,37,205,0.25)] backdrop-blur-[1px] scale-105'
                : clicking
                ? 'border-primary scale-90 bg-primary/20'
                : 'border-primary/40 bg-transparent'
            }`}
          />

          {/* Precision 4-Axis Reticle Crosshair Ticks */}
          {!isInteractive && (
            <>
              {/* North tick */}
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-[1.5px] h-[3px] bg-primary/60" />
              {/* South tick */}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 w-[1.5px] h-[3px] bg-primary/60" />
              {/* West tick */}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 h-[1.5px] w-[3px] bg-primary/60" />
              {/* East tick */}
              <span className="absolute right-0 top-1/2 -translate-y-1/2 -mr-1 h-[1.5px] w-[3px] bg-primary/60" />
            </>
          )}

          {/* Micro Dynamic Telemetry Context Badge */}
          {hoverState.label && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-white font-mono text-[9px] font-semibold tracking-wider uppercase shadow-md backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {hoverState.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
