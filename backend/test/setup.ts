/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Test Setup Configuration
 * Template: Eventzr Code Repository Template v1.0
 */

import { Logger } from '@nestjs/common';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Mock external services
jest.mock('../src/common/adapters/auth.adapter');
jest.mock('../src/common/adapters/audit.adapter');
jest.mock('../src/common/adapters/api-gateway.adapter');
jest.mock('../src/common/adapters/cache.adapter');

// Suppress console logs during testing unless debugging
if (!process.env.DEBUG_TESTS) {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
}

// Global test timeout
jest.setTimeout(30000);

// Setup global mocks
global.mockTenantId = '123e4567-e89b-12d3-a456-426614174001';
global.mockUserId = '123e4567-e89b-12d3-a456-426614174002';
global.mockCorrelationId = 'test-correlation-id';

// Mock Prisma client for unit tests
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    taxonomy: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    classification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  })),
  TaxonomyStatus: {
    draft: 'draft',
    active: 'active',
    archived: 'archived',
  },
}));

// Extend Jest matchers
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toHaveValidTimestamp(received: any) {
    const isValidDate = !isNaN(Date.parse(received));
    
    if (isValidDate) {
      return {
        message: () => `expected ${received} not to be a valid timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid timestamp`,
        pass: false,
      };
    }
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toHaveValidTimestamp(): R;
    }
  }
}
