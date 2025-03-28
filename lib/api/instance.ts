import ky, { HTTPError } from "ky";
import { DEFAULT_CONFIG } from "./config";
import { ErrorResponse, ApiConfig } from "./types";

// Define ApiError as a class instead of just a type
class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const createKyInstance = (config: ApiConfig = DEFAULT_CONFIG) => {
  return ky.create({
    prefixUrl: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
    hooks: {
      beforeError: [
        async (error: HTTPError) => {
          const { response } = error;

          try {
            const body = (await response.json()) as ErrorResponse;

            if (body.error) {
              throw new ApiError(
                body.error.message,
                response.status,
                body.error.code,
              );
            }

            throw new ApiError("An unexpected error occurred", response.status);
          } catch (parseError) {
            if (parseError instanceof ApiError) {
              throw parseError;
            }
            throw new ApiError(response.statusText, response.status);
          }
        },
      ],
    },
  });
};

export default createKyInstance;
export { ApiError };
