/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Search Interface Component - Advanced Search UI
 * Template: Eventzr Code Repository Template v1.0
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { taxonomyApi } from '@/lib/api/taxonomy-client';
import { useTaxonomyStore } from '@/lib/stores/taxonomy-store';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Search,
  Filter,
  X,
  Loader2,
  History,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface SearchInterfaceProps {
  initialQuery?: string;
  initialType?: string;
  initialNamespace?: string;
  onSearch?: (query: string, filters: any) => void;
}

const SEARCH_TYPES = [
  { value: 'all', label: 'All Results' },
  { value: 'categories', label: 'Categories' },
  { value: 'namespaces', label: 'Namespaces' },
  { value: 'tags', label: 'Tags' },
  { value: 'classifications', label: 'Classifications' },
];

const POPULAR_SEARCHES = [
  'music events',
  'outdoor venues',
  'food categories',
  'sports tournaments',
  'art exhibitions',
  'business conferences',
];

const RECENT_SEARCHES = [
  'jazz concerts',
  'wedding venues',
  'tech events',
  'art galleries',
];

export function SearchInterface({
  initialQuery = '',
  initialType = 'all',
  initialNamespace = '',
  onSearch,
}: SearchInterfaceProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [type, setType] = React.useState(initialType);
  const [namespace, setNamespace] = React.useState(initialNamespace);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [recentSearches, setRecentSearches] = React.useState<string[]>(RECENT_SEARCHES);
  
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('taxonomy-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Get autocomplete suggestions
  const autocompleteQuery = useMutation({
    mutationFn: (searchQuery: string) => 
      taxonomyApi.autocomplete(searchQuery, type === 'all' ? 'categories' : type as any, 5),
    onSuccess: (data) => {
      if (data.success) {
        setSuggestions(data.data);
      }
    },
  });

  React.useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 1) {
      autocompleteQuery.mutate(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const handleSearch = React.useCallback((searchQuery = query, searchType = type, searchNamespace = namespace) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('taxonomy-recent-searches', JSON.stringify(newRecent));

    // Hide suggestions
    setShowSuggestions(false);

    // Trigger search
    if (onSearch) {
      onSearch(searchQuery, { type: searchType, namespace: searchNamespace });
    } else {
      // Navigate with search params
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (searchType !== 'all') params.set('type', searchType);
      if (searchNamespace) params.set('namespace', searchNamespace);
      
      router.push(`/search?${params.toString()}`);
    }
  }, [query, type, namespace, recentSearches, onSearch, router]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const handlePopularSearch = (search: string) => {
    setQuery(search);
    handleSearch(search);
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    handleSearch(search);
  };

  const clearQuery = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('taxonomy-recent-searches');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Taxonomies
          </CardTitle>
          <CardDescription>
            Search across all namespaces, categories, and classifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for categories, namespaces, or content..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-10"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearQuery}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Button onClick={() => handleSearch()} disabled={!query.trim()}>
                {autocompleteQuery.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || query.length === 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50">
                {query.length === 0 ? (
                  <div className="p-4 space-y-4">
                    {/* Popular Searches */}
                    {POPULAR_SEARCHES.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Popular Searches</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {POPULAR_SEARCHES.map((search) => (
                            <Badge
                              key={search}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => handlePopularSearch(search)}
                            >
                              {search}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <History className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Recent Searches</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearRecentSearches}
                            className="text-xs"
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {recentSearches.slice(0, 5).map((search) => (
                            <button
                              key={search}
                              onClick={() => handleRecentSearch(search)}
                              className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-3 py-1 text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Suggestions
                    </div>
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Type:</span>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Namespace:</span>
              <Select value={namespace} onValueChange={setNamespace}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All namespaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All namespaces</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="venues">Venues</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(type !== 'all' || namespace) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setType('all');
                  setNamespace('');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(type !== 'all' || namespace) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {type !== 'all' && (
                <Badge variant="secondary">
                  Type: {SEARCH_TYPES.find(t => t.value === type)?.label}
                  <button
                    onClick={() => setType('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {namespace && (
                <Badge variant="secondary">
                  Namespace: {namespace}
                  <button
                    onClick={() => setNamespace('')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Search Tips:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use quotes for exact phrases: <code>"music events"</code></li>
              <li>Use wildcards: <code>event*</code> matches events, eventful, etc.</li>
              <li>Combine terms: <code>music AND outdoor</code></li>
              <li>Exclude terms: <code>events -sports</code></li>
              <li>Search by fields: <code>name:music</code> or <code>description:outdoor</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

