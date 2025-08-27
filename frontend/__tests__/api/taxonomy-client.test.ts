/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BaseApiClient,ApiError } from '@/lib/api/base-client';
import { taxonomyApi } from '../../src/lib/api/taxonomy-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BaseApiClient', () => {
  let client: BaseApiClient;

  beforeEach(() => {
    client = new BaseApiClient('https://api.test.com', 'v1/taxonomy');
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('creates client with base URL and endpoint', () => {
      expect(client['baseURL']).toBe('https://api.test.com/v1/taxonomy');
    });

    it('creates client with base URL only', () => {
      const simpleClient = new BaseApiClient('https://api.test.com');
      expect(simpleClient['baseURL']).toBe('https://api.test.com');
    });

    it('sets default headers', () => {
      expect(client['defaultHeaders']).toEqual({
        'Content-Type': 'application/json',
      });
    });

    it('sets default timeout', () => {
      expect(client['timeout']).toBe(10000);
    });
  });

  describe('authentication', () => {
    it('sets auth token', () => {
      client.setAuthToken('test-token');
      expect(client['defaultHeaders'].Authorization).toBe('Bearer test-token');
    });

    it('removes auth token', () => {
      client.setAuthToken('test-token');
      client.removeAuthToken();
      expect(client['defaultHeaders'].Authorization).toBeUndefined();
    });
  });

  describe('GET requests', () => {
    it('makes successful GET request', async () => {
      const mockResponse = { success: true, data: { id: 1, name: 'test' } };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client['get']('/test');

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/v1/taxonomy/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('makes GET request with query parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      await client['get']('/test', { page: 1, limit: 10, search: 'query' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/taxonomy/test?page=1&limit=10&search=query',
        expect.any(Object)
      );
    });

    it('filters out null and undefined parameters', async () => {
      const mockResponse = { success: true, data: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      await client['get']('/test', { 
        page: 1, 
        limit: null, 
        search: undefined, 
        active: true 
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/taxonomy/test?page=1&active=true',
        expect.any(Object)
      );
    });
  });

  describe('POST requests', () => {
    it('makes successful POST request', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const requestData = { name: 'test', description: 'test description' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client['post']('/test', requestData);

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/v1/taxonomy/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('handles FormData requests', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const formData = new FormData();
      formData.append('name', 'test');
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      await client['post']('/test', formData);

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/v1/taxonomy/test', {
        method: 'POST',
        headers: {}, // Content-Type should be removed for FormData
        body: formData,
        signal: undefined,
      });
    });
  });

  describe('PUT requests', () => {
    it('makes successful PUT request', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const requestData = { name: 'updated test' };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client['put']('/test/1', requestData);

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/v1/taxonomy/test/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('DELETE requests', () => {
    it('makes successful DELETE request', async () => {
      const mockResponse = { success: true };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client['del']('/test/1');

      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/v1/taxonomy/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('error handling', () => {
    it('throws ApiError for HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(client['get']('/test')).rejects.toThrow(ApiError);
      await expect(client['get']('/test')).rejects.toThrow('Resource not found');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(client['get']('/test')).rejects.toThrow(ApiError);
      await expect(client['get']('/test')).rejects.toThrow('Network error: Network error');
    });

    it('handles timeout errors', async () => {
      mockFetch.mockRejectedValue(new DOMException('AbortError', 'AbortError'));

      await expect(client['get']('/test')).rejects.toThrow(ApiError);
      await expect(client['get']('/test')).rejects.toThrow('Request timeout');
    });

    it('handles non-JSON error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Not JSON'); },
      });

      await expect(client['get']('/test')).rejects.toThrow('HTTP 500: Internal Server Error');
    });
  });

  describe('response handling', () => {
    it('handles JSON responses', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client['get']('/test');
      expect(result).toEqual(mockResponse);
    });

    it('handles text responses', async () => {
      const mockResponse = 'Plain text response';
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/plain']]),
        text: async () => mockResponse,
      });

      const result = await client['get']('/test');
      expect(result).toBe(mockResponse);
    });

    it('handles blob responses', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/octet-stream' });
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/octet-stream']]),
        blob: async () => mockBlob,
      });

      const result = await client['get']('/test');
      expect(result).toBe(mockBlob);
    });
  });

  describe('health check', () => {
    it('calls health endpoint', async () => {
      const mockResponse = { status: 'healthy', timestamp: '2024-01-01T00:00:00Z' };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: async () => mockResponse,
      });

      const result = await client.healthCheck();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/taxonomy/health',
        expect.any(Object)
      );
      expect(result).toEqual(mockResponse);
    });
  });
});

describe('TaxonomyApi Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('is configured with correct base URL', () => {
    expect(taxonomyApi['baseURL']).toContain('/v1/taxonomy');
  });

  it('has correct timeout setting', () => {
    expect(taxonomyApi['timeout']).toBe(15000);
  });
});

describe('ApiError', () => {
  it('creates error with message and status', () => {
    const error = new ApiError('Test error', 400);
    
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(400);
  });

  it('creates error with additional details', () => {
    const details = { field: 'name', reason: 'required' };
    const error = new ApiError('Validation error', 422, 'VALIDATION_ERROR', details);
    
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });
});
