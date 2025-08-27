/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Health Check API Route - For Kubernetes Probes
 * Template: Eventzr Code Repository Template v1.0
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      service: 'taxonomy-frontend',
      port: 3201,
    };

    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error) {
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      service: 'taxonomy-frontend',
      port: 3201,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
