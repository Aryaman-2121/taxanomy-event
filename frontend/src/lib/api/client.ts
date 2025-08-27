/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 */

import { BaseApiClient } from './base-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.eventzr.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const taxonomyApi = new BaseApiClient(API_BASE_URL, `${API_VERSION}/taxonomy`);

// Set default timeout
taxonomyApi['timeout'] = 15000; // 15 seconds

export default taxonomyApi;
