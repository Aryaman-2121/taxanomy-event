/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Not Found Page - 404 Error Page
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FolderTree className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-2">
            404
          </CardTitle>
          <CardTitle className="text-xl">Page Not Found</CardTitle>
          <CardDescription>
            The taxonomy or page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Here are some things you can try:
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-1">
              <li>• Check the URL for typos</li>
              <li>• Use the search function to find what you need</li>
              <li>• Go back to the homepage</li>
              <li>• Browse our taxonomy categories</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
          </div>

          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

