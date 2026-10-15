'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { LandingAmbient } from '@/components/landing/landing-ambient';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingMarquee } from '@/components/landing/landing-marquee';
import { LandingBento } from '@/components/landing/landing-bento';
import { LandingComparison } from '@/components/landing/landing-comparison';
import { LandingShowcase } from '@/components/landing/landing-showcase';
import { LandingWorkflow } from '@/components/landing/landing-workflow';
import { LandingStats } from '@/components/landing/landing-stats';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';
import { LandingPricing } from '@/components/landing/landing-pricing';
import { LandingFaq } from '@/components/landing/landing-faq';
import { LandingCta } from '@/components/landing/landing-cta';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/workspaces');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* 1. Global Ambient Background Glow & Scroll Indicator */}
      <LandingAmbient />

      {/* 2. Sticky Glassmorphic Navbar */}
      <LandingNav />

      {/* 3. Hero Section with Live Kanban Preview */}
      <main>
        <LandingHero />

        {/* 4. Trusted By Infinite Marquee */}
        <LandingMarquee />

        {/* 5. Powerful Engine Bento Grid */}
        <LandingBento />

        {/* 6. Why TaskFlow vs Legacy Tools */}
        <LandingComparison />

        {/* 7. Interactive Multi-Tab Dashboard Deep Dive */}
        <LandingShowcase />

        {/* 8. Stepped Workflow Timeline */}
        <LandingWorkflow />

        {/* 9. Live Verified Performance Stats */}
        <LandingStats />

        {/* 10. Wall of Love Testimonials */}
        <LandingTestimonials />

        {/* 11. Transparent Simple Pricing */}
        <LandingPricing />

        {/* 12. Frequently Asked Questions */}
        <LandingFaq />

        {/* 13. Final High-Impact CTA */}
        <LandingCta />
      </main>

      {/* 14. Comprehensive Footer */}
      <LandingFooter />
    </div>
  );
}
