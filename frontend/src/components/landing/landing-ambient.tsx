'use client';

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function LandingAmbient() {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* 2. Interactive Mouse Spotlight Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 opacity-60"
        style={{
          background: `radial-gradient(650px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
        }}
      />

      {/* 3. Deep Ambient Background Mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Subtle geometric dot grid */}
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Top-center Hero Aurora Glow */}
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] rounded-full bg-gradient-to-b from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] pointer-events-none" />

        {/* Left violet orb */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[35%] -left-[10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"
        />

        {/* Right cyan/indigo orb */}
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-[60%] -right-[10%] w-[650px] h-[650px] rounded-full bg-cyan-500/10 blur-[160px] pointer-events-none"
        />
      </div>

      {/* 4. Floating Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-[#111625]/90 border border-white/10 text-white/80 hover:text-white hover:border-indigo-500/50 shadow-lg shadow-black/40 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </>
  );
}

