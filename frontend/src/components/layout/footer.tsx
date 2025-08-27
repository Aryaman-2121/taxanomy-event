/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Footer Component - App Footer
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FolderTree, Github, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Taxonomy Service</h3>
                <p className="text-xs text-muted-foreground">Eventzr Platform</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Entity-specific taxonomies and categorization system for events, venues, and content across the platform.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                v1.0.0
              </Badge>
              <Badge variant="outline" className="text-xs">
                Port 3201
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/namespaces" className="text-muted-foreground hover:text-foreground transition-colors">
                  Namespaces
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/classifications" className="text-muted-foreground hover:text-foreground transition-colors">
                  Classifications
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs/api"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  API Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="/docs/guide"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  User Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <Link href="/health" className="text-muted-foreground hover:text-foreground transition-colors">
                  System Health
                </Link>
              </li>
              <li>
                <Link href="/metrics" className="text-muted-foreground hover:text-foreground transition-colors">
                  Metrics
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/eventzr/taxonomy"
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3 w-3" />
                  Source Code
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:support@eventzr.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Support
                </a>
              </li>
              <li>
                <a
                  href="/help/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/help/troubleshooting"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Troubleshooting
                </a>
              </li>
              <li>
                <a
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Send Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <p>© 2025 Eventful India Marketing Services. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>by the Eventzr Platform Team</span>
          </div>
        </div>

        {/* Service Status */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>All Systems Operational</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Last Updated:</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

