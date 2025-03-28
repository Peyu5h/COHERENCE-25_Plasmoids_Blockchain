export interface ValidationError {
  code: string;
  message: string;
  path?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  code: string;
  validation?: Record<string, string[]>;
}

export interface ErrorResponse {
  success: false;
  error: ApiError;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableAuth?: boolean;
}

export class ApiClientError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}
