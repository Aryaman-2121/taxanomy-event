/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Test Setup - Global Test Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Mock MSW setup without actual server (to avoid handler issues)
// const { setupServer } = await import('msw/node');
// const { handlers } = await import('./mocks/handlers');
// export const server = setupServer(...handlers);

beforeAll(() => {
  // server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  // server.resetHandlers();
});

afterAll(() => {
  // server.close();
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];

  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props);
  },
}));

// Custom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received && document.body.contains(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
    };
  },
});


