/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Navigation Component - Main App Navigation
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import {
  FolderTree,
  Layers,
  Tags,
  Search,
  BarChart3,
  Settings,
  User,
  LogOut,
  Menu,
  Plus,
  Download,
  Upload,
} from 'lucide-react';

const NavigationItem = ({
  href,
  children,
  icon: Icon,
  badge,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  isActive?: boolean;
}) => (
  <Link
    href={href}
    className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      isActive && 'bg-accent text-accent-foreground'
    )}
  >
    <Icon className="h-4 w-4" />
    <span>{children}</span>
    {badge && (
      <Badge variant="secondary" className="ml-auto">
        {badge}
      </Badge>
    )}
  </Link>
);

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { stats, toggleSidebar, openCreateNamespace, openCreateCategory } = useTaxonomyStore();

  const navigationItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: BarChart3,
      isActive: pathname === '/',
    },
    {
      href: '/namespaces',
      label: 'Namespaces',
      icon: Layers,
      badge: stats.totalNamespaces > 0 ? stats.totalNamespaces : undefined,
      isActive: pathname.startsWith('/namespaces'),
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: FolderTree,
      badge: stats.totalCategories > 0 ? stats.totalCategories : undefined,
      isActive: pathname.startsWith('/categories'),
    },
    {
      href: '/classifications',
      label: 'Classifications',
      icon: Tags,
      badge: stats.totalClassifications > 0 ? stats.totalClassifications : undefined,
      isActive: pathname.startsWith('/classifications'),
    },
    {
      href: '/search',
      label: 'Search',
      icon: Search,
      isActive: pathname.startsWith('/search'),
    },
  ];

  const quickActions = [
    {
      label: 'Create Namespace',
      icon: Layers,
      onClick: openCreateNamespace,
    },
    {
      label: 'Create Category',
      icon: FolderTree,
      onClick: openCreateCategory,
    },
    {
      label: 'Import Taxonomy',
      icon: Upload,
      onClick: () => {}, // TODO: Implement
    },
    {
      label: 'Export Data',
      icon: Download,
      onClick: () => {}, // TODO: Implement
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <FolderTree className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold">Taxonomy</h1>
              <p className="text-xs text-muted-foreground">Eventzr Platform</p>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Navigation - Desktop */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <NavigationMenuLink asChild>
                  <NavigationItem
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    isActive={item.isActive}
                  >
                    {item.label}
                  </NavigationItem>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            {/* Quick Actions Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-64 p-4">
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="ghost"
                        size="sm"
                        onClick={action.onClick}
                        className="w-full justify-start"
                      >
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {/* Search Quick Access */}
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Link>
          </Button>

          {/* User Profile Dropdown */}
          {user ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-64 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4 space-y-2">
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <User className="h-4 w-4 mr-2" />
                            Profile Settings
                          </Button>
                          <Button variant="ghost" size="sm" className="w-full justify-start">
                            <Settings className="h-4 w-4 mr-2" />
                            Preferences
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="w-full justify-start text-destructive hover:text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-background">
        <div className="container py-4">
          <nav className="grid grid-cols-2 gap-2">
            {navigationItems.slice(0, 4).map((item) => (
              <NavigationItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                badge={item.badge}
                isActive={item.isActive}
              >
                {item.label}
              </NavigationItem>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
