/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * MSW Handlers - API Mocking (Temporarily disabled for build compatibility)
 * Template: Eventzr Code Repository Template v1.0
 */

// TODO: Update to MSW v2 syntax when needed for testing
// import { http } from 'msw';
// import { mockNamespaces, mockCategories, mockClassifications } from './data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.eventzr.com';
const BASE_URL = `${API_BASE_URL}/v1/taxonomy`;

// Temporary empty handlers array to prevent build errors
// This file is only used for testing and doesn't affect production build
export const handlers: any[] = [
  // MSW handlers will be implemented here when needed for testing
  // Using MSW v2 syntax with http.get/post instead of rest.get/post
];

// Export for testing setup
export { BASE_URL };

