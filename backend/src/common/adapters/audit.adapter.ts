/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Audit Adapter - Golden Rule #2
 * Template: Eventzr Code Repository Template v1.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface AuditEntry {
  action: string;
  tenant_id: string;
  user_id?: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  correlation_id?: string;
}

export interface BulkAuditEntry {
  entries: AuditEntry[];
  batch_id: string;
}

@Injectable()
export class AuditAdapter {
  private readonly logger = new Logger(AuditAdapter.name);
  private readonly httpClient: AxiosInstance;
  private readonly batchSize: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('audit') private readonly auditQueue: Queue,
  ) {
    const auditConfig = this.configService.get('integration.audit');
    
    this.httpClient = axios.create({
      baseURL: auditConfig.baseUrl,
      timeout: auditConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'taxonomy-service/1.0.0',
      },
    });

    this.batchSize = auditConfig.batchSize;
    this.setupRetryInterceptor();
  }

  /**
   * Log single audit entry
   */
  async log(entry: AuditEntry): Promise<void> {
    try {
      // Add to queue for async processing
      await this.auditQueue.add('audit-entry', entry, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      });

      this.logger.debug('Audit entry queued', {
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        tenant_id: entry.tenant_id,
      });
    } catch (error) {
      this.logger.error('Failed to queue audit entry', {
        entry,
        error: (error as Error).message,
      });
      
      // Fallback to direct API call
      await this.sendAuditEntry(entry);
    }
  }

  /**
   * Log bulk audit entries
   */
  async logBulk(entries: AuditEntry[]): Promise<void> {
    try {
      const batches = this.chunkArray(entries, this.batchSize);
      
      for (const batch of batches) {
        const bulkEntry: BulkAuditEntry = {
          entries: batch,
          batch_id: this.generateBatchId(),
        };

        await this.auditQueue.add('audit-bulk', bulkEntry, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 50,
          removeOnFail: 25,
        });
      }

      this.logger.debug('Bulk audit entries queued', {
        totalEntries: entries.length,
        batches: batches.length,
      });
    } catch (error) {
      this.logger.error('Failed to queue bulk audit entries', {
        count: entries.length,
        error: (error as Error).message,
      });
      
      // Fallback to direct API calls
      for (const entry of entries) {
        await this.sendAuditEntry(entry);
      }
    }
  }

  /**
   * Log taxonomy creation
   */
  async logTaxonomyCreated(
    tenantId: string,
    userId: string,
    taxonomy: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'taxonomy.created',
      tenant_id: tenantId,
      user_id: userId,
      resource_type: 'taxonomy',
      resource_id: taxonomy.id,
      new_values: {
        name: taxonomy.name,
        namespace: taxonomy.namespace,
        status: taxonomy.status,
      },
      metadata: {
        ...metadata,
        service: 'taxonomy',
        version: '1.0.0',
      },
    });
  }

  /**
   * Log taxonomy update
   */
  async logTaxonomyUpdated(
    tenantId: string,
    userId: string,
    taxonomyId: string,
    oldValues: any,
    newValues: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'taxonomy.updated',
      tenant_id: tenantId,
      user_id: userId,
      resource_type: 'taxonomy',
      resource_id: taxonomyId,
      old_values: oldValues,
      new_values: newValues,
      metadata: {
        ...metadata,
        service: 'taxonomy',
        version: '1.0.0',
      },
    });
  }

  /**
   * Log entity classification
   */
  async logClassificationCreated(
    tenantId: string,
    userId: string,
    classification: any,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'classification.created',
      tenant_id: tenantId,
      user_id: userId,
      resource_type: 'classification',
      resource_id: classification.id,
      new_values: {
        entity_type: classification.entity_type,
        entity_id: classification.entity_id,
        category_id: classification.category_id,
        assigned_by: classification.assigned_by,
        confidence_score: classification.confidence_score,
      },
      metadata: {
        ...metadata,
        service: 'taxonomy',
        version: '1.0.0',
      },
    });
  }

  /**
   * Log bulk classification operations
   */
  async logBulkClassification(
    tenantId: string,
    userId: string,
    operation: string,
    affectedCount: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `classification.bulk.${operation}`,
      tenant_id: tenantId,
      user_id: userId,
      resource_type: 'classification',
      resource_id: `bulk-${Date.now()}`,
      new_values: {
        operation: operation,
        affected_count: affectedCount,
      },
      metadata: {
        ...metadata,
        service: 'taxonomy',
        version: '1.0.0',
      },
    });
  }

  /**
   * Send audit entry to audit service
   */
  private async sendAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      const response = await this.httpClient.post('/v1/audit/log', {
        ...entry,
        timestamp: new Date().toISOString(),
        service: 'taxonomy',
        service_version: '1.0.0',
      });

      if (!response.data?.success) {
        throw new Error(`Audit service returned failure: ${response.data?.message}`);
      }
    } catch (error) {
      this.logger.error('Failed to send audit entry to audit service', {
        entry,
        error: (error as Error).message,
      });
      
      // Don't throw error to avoid breaking main operations
      // Audit is important but should not break business logic
    }
  }

  /**
   * Send bulk audit entries to audit service
   */
  private async sendBulkAuditEntries(bulkEntry: BulkAuditEntry): Promise<void> {
    try {
      const response = await this.httpClient.post('/v1/audit/bulk', {
        ...bulkEntry,
        timestamp: new Date().toISOString(),
        service: 'taxonomy',
        service_version: '1.0.0',
      });

      if (!response.data?.success) {
        throw new Error(`Audit service returned failure: ${response.data?.message}`);
      }

      this.logger.debug('Bulk audit entries sent successfully', {
        batch_id: bulkEntry.batch_id,
        count: bulkEntry.entries.length,
      });
    } catch (error) {
      this.logger.error('Failed to send bulk audit entries to audit service', {
        batch_id: bulkEntry.batch_id,
        count: bulkEntry.entries.length,
        error: (error as Error).message,
      });
      
      // Fallback to individual entries
      for (const entry of bulkEntry.entries) {
        await this.sendAuditEntry(entry);
      }
    }
  }

  /**
   * Utility: Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup retry interceptor for resilience
   */
  private setupRetryInterceptor(): void {
    const retryConfig = this.configService.get('integration.retry');
    
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config } = error;
        
        if (!config || !config.retry) {
          config.retry = { count: 0, maxAttempts: retryConfig.maxAttempts };
        }

        const { count, maxAttempts } = config.retry;
        
        if (count < maxAttempts && this.isRetryableError(error)) {
          config.retry.count += 1;
          
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, count),
            retryConfig.maxDelay
          );
          
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.httpClient(config);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!(error as any).response) return true; // Network error
    
    const status = (error as any).response.status;
    return status >= 500 || status === 429; // Server error or rate limited
  }
}


