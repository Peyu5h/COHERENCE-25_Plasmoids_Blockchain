import { ApiResponse, ErrorResponse } from "./types";

interface ErrorOptions {
  status?: number;
  code?: string;
}

export function success<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function err(
  message: string,
  options: ErrorOptions = {},
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      status: options.status || 500,
      code: options.code || "SERVER_ERROR",
    },
  };
}

export function validationErr(errors: Record<string, string[]>): ErrorResponse {
  return {
    success: false,
    error: {
      message: "Validation failed",
      status: 400,
      code: "VALIDATION_ERROR",
      validation: errors,
    },
  };
}
