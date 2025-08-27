/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Prisma Database Service
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const databaseConfig = configService.get('database');
    
    super({
      datasources: {
        db: {
          url: databaseConfig.url,
        },
      },
      log: databaseConfig.prisma.log,
      errorFormat: databaseConfig.prisma.errorFormat,
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connection established');
      
      // Enable RLS for multi-tenancy
      if (this.configService.get('database.enableRLS')) {
        await this.enableRowLevelSecurity();
      }
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('✅ Database connection closed');
  }

  /**
   * Set tenant context for RLS policies
   */
  async setTenantContext(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new Error('Tenant ID is required for database operations');
    }

    try {
      await this.$executeRaw`SELECT set_tenant_context(${tenantId}::uuid)`;
    } catch (error) {
      this.logger.error(`Failed to set tenant context: ${tenantId}`, error);
      throw new Error('Failed to set tenant context');
    }
  }

  /**
   * Execute transaction with tenant context
   */
  async executeInTenantContext<T>(
    tenantId: string, 
    operation: (prisma: PrismaService) => Promise<T>
  ): Promise<T> {
    return this.$transaction(async (prisma) => {
      // Set tenant context for this transaction
      await prisma.$executeRaw`SELECT set_tenant_context(${tenantId}::uuid)`;
      return await operation(this);
    });
  }

  /**
   * Enable Row Level Security
   */
  private async enableRowLevelSecurity(): Promise<void> {
    try {
      await this.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'set_tenant_context'
          ) THEN
            CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
            RETURNS VOID AS '
            BEGIN
              PERFORM set_config(''app.current_tenant_id'', tenant_uuid::text, TRUE);
            END;
            ' LANGUAGE plpgsql SECURITY DEFINER;
          END IF;
        END $$;
      `;

      await this.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'get_current_tenant_id'
          ) THEN
            CREATE OR REPLACE FUNCTION get_current_tenant_id()
            RETURNS UUID AS '
            BEGIN
              RETURN current_setting(''app.current_tenant_id'', TRUE)::UUID;
            END;
            ' LANGUAGE plpgsql STABLE SECURITY DEFINER;
          END IF;
        END $$;
      `;

      this.logger.log('✅ Row Level Security functions enabled');
    } catch (error) {
      this.logger.error('❌ Failed to enable RLS functions', error);
      throw error;
    }
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;
      return { status: 'healthy', latency };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
}
