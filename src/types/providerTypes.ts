// This file contains types related to providers.

export interface ProviderConfig {
  apiKey: string;
  endpoint: string;
  timeout?: number;
}

export interface ProviderResponse {
  success: boolean;
  data?: any;
  error?: string;
}
