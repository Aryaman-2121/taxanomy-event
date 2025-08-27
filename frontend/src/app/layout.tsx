/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Root Layout - Next.js App Router
 * Template: Eventzr Code Repository Template v1.0
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers/providers';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Taxonomy Management | Eventzr',
  description: 'Entity-specific taxonomies and categorization system for events, venues, and content across the Eventzr platform',
  keywords: 'taxonomy, categorization, events, venues, content management, Eventzr',
  authors: [{ name: 'Eventzr Platform Team' }],
  creator: 'Eventful India Marketing Services',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://api.eventzr.com/v1/taxonomy',
    siteName: 'Eventzr Taxonomy',
    title: 'Taxonomy Management | Eventzr',
    description: 'Manage hierarchical classifications and tags for all Eventzr entities',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taxonomy Management | Eventzr',
    description: 'Manage hierarchical classifications and tags for all Eventzr entities',
    creator: '@eventzr',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = 'width=device-width, initial-scale=1';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
