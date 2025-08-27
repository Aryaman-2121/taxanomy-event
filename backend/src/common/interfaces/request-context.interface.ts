/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 * All rights reserved.
 * 
 * Service: taxonomy
 * Port: 3201
 * Request Context Interface
 * Template: Eventzr Code Repository Template v1.0
 */

import { Request } from 'express';

export interface RequestContext {
  userId: string;
  tenantId: string;
  correlationId: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  roles?: string[];
  permissions?: string[];
  scope?: string[];
}

export interface RequestWithContext extends Request {
  context: RequestContext;
}
