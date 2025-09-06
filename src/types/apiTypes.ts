// This file contains types related to API interactions.

export interface ApiRequest {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface ApiResponse {
  status: number;
  data: any;
  error?: string;
}
