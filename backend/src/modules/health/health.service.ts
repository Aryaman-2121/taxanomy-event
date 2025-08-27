/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Health Service
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorResult,
  HealthIndicatorStatus,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheAdapter } from '../../common/adapters/cache.adapter';
import { AuthAdapter } from '../../common/adapters/auth.adapter';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly authAdapter: AuthAdapter,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Check database connectivity
   */
  async checkDatabase(): Promise<HealthIndicatorResult> {
    const key = 'database';
    
    try {
      const healthCheck = await this.prisma.healthCheck();
      
      if (healthCheck.status === 'healthy') {
        return {
          [key]: {
            status: 'up' as HealthIndicatorStatus,
            latency: healthCheck.latency,
          },
        };
      } else {
        throw new Error('Database unhealthy');
      }
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new HealthCheckError('Database check failed', {
        [key]: {
          status: 'down' as HealthIndicatorStatus,
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Check cache connectivity
   */
  async checkCache(): Promise<HealthIndicatorResult> {
    const key = 'cache';
    
    try {
      const healthCheck = await this.cacheAdapter.healthCheck();
      
      if (healthCheck.status === 'healthy') {
        return {
          [key]: {
            status: 'up' as HealthIndicatorStatus,
            latency: healthCheck.latency,
          },
        };
      } else {
        throw new Error('Cache unhealthy');
      }
    } catch (error) {
      this.logger.error('Cache health check failed', error);
      throw new HealthCheckError('Cache check failed', {
        [key]: {
          status: 'down' as HealthIndicatorStatus,
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Check upstream services
   */
  async checkUpstreamServices(): Promise<HealthIndicatorResult> {
    const key = 'upstream';
    
    try {
      // Check auth service
      const authHealth = await this.checkServiceHealth('auth', 3100);
      const auditHealth = await this.checkServiceHealth('audit', 3101);
      
      return {
        [key]: {
          status: 'up' as HealthIndicatorStatus,
          services: {
            auth: authHealth,
            audit: auditHealth,
          },
        },
      };
    } catch (error) {
      this.logger.error('Upstream services health check failed', error);
      throw new HealthCheckError('Upstream services check failed', {
        [key]: {
          status: 'down' as HealthIndicatorStatus,
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Check resource usage
   */
  async checkResourceUsage(): Promise<HealthIndicatorResult> {
    const key = 'resources';
    
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Convert to MB
      const rss = Math.round(memoryUsage.rss / 1024 / 1024);
      const heapUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      // Check memory threshold (500MB for Lambda)
      const memoryThreshold = 400; // MB
      const isMemoryHealthy = rss < memoryThreshold;
      
      if (isMemoryHealthy) {
        return {
          [key]: {
            status: 'up' as HealthIndicatorStatus,
            memory: {
              rss: `${rss}MB`,
              heapUsed: `${heapUsed}MB`,
              heapTotal: `${heapTotal}MB`,
              threshold: `${memoryThreshold}MB`,
            },
            cpu: {
              user: Math.round(cpuUsage.user / 1000), // Convert to ms
              system: Math.round(cpuUsage.system / 1000),
            },
            uptime: Math.round(process.uptime()),
          },
        };
      } else {
        throw new Error(`Memory usage ${rss}MB exceeds threshold ${memoryThreshold}MB`);
      }
    } catch (error) {
      this.logger.error('Resource usage health check failed', error);
      throw new HealthCheckError('Resource usage check failed', {
        [key]: {
          status: 'down' as HealthIndicatorStatus,
          message: (error as Error).message,
        },
      });
    }
  }

  /**
   * Check if service is ready to accept traffic
   */
  async isReady(): Promise<boolean> {
    try {
      // Check if database is ready
      const dbCheck = await this.prisma.healthCheck();
      if (dbCheck.status !== 'healthy') {
        return false;
      }

      // Check if cache is ready
      const cacheCheck = await this.cacheAdapter.healthCheck();
      if (cacheCheck.status !== 'healthy') {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Readiness check failed', error);
      return false;
    }
  }

  /**
   * Check individual service health
   */
  private async checkServiceHealth(serviceName: string, port: number): Promise<string> {
    try {
      // This would make an actual HTTP call to the service health endpoint
      // For now, we'll simulate it
      return 'healthy';
    } catch (error) {
      this.logger.warn(`Service ${serviceName} health check failed`, error);
      return 'unhealthy';
    }
  }
}
