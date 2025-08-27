/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Performance Monitor - Web Vitals Tracking
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (command: string, action: string, params?: any) => void;
  }
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
}

export function PerformanceMonitor() {
  useEffect(() => {
    let isInitialized = false;

    const initPerformanceMonitoring = async () => {
      if (isInitialized || typeof window === 'undefined') return;

      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

        const handleMetric = (metric: PerformanceMetric) => {
          // Log to console in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Web Vital:', metric);
          }

          // Send to analytics
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', metric.name, {
              value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
              event_category: 'Web Vitals',
              event_label: metric.id,
              non_interaction: true,
            });
          }

          // Send to custom analytics endpoint
          fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              metric: metric.name,
              value: metric.value,
              rating: metric.rating,
              id: metric.id,
              timestamp: Date.now(),
              url: window.location.href,
            }),
          }).catch(err => console.warn('Failed to send web vitals:', err));
        };

        // Collect all Web Vitals metrics
        onCLS(handleMetric);
        onINP(handleMetric);
        onFCP(handleMetric);
        onLCP(handleMetric);
        onTTFB(handleMetric);

        isInitialized = true;
      } catch (error) {
        console.warn('Failed to initialize performance monitoring:', error);
      }
    };

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Track route changes
    const handleRouteChange = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: window.location.pathname,
        });
      }
    };

    // Listen for route changes (Next.js specific)
    window.addEventListener('beforeunload', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Custom hook for performance tracking
export function usePerformanceTracker() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      // Track with Google Analytics
      if (window.gtag) {
        window.gtag('event', eventName, parameters);
      }

      // Track with custom analytics
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          parameters,
          timestamp: Date.now(),
          url: window.location.href,
        }),
      }).catch(err => console.warn('Failed to track event:', err));
    }
  };

  const trackTiming = (name: string, startTime: number) => {
    const duration = performance.now() - startTime;
    trackEvent('timing', {
      name,
      duration: Math.round(duration),
      category: 'Performance',
    });
  };

  return { trackEvent, trackTiming };
}
