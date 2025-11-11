import type { ConnectedWalletClient, Credentials } from "@polys/signer";
import ky, { type HTTPError, type KyInstance } from "ky";
import { createL1Headers, createL2Headers } from "./auth/headers.ts";
import {
  ApiError,
  AuthenticationError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from "./errors.ts";

const DEFAULT_BASE_URL = "https://clob.polymarket.com";
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RETRIES = 3;

type AuthRequirement =
  | { kind: "none" }
  | { kind: "l1"; nonce: number; timestamp?: number }
  | { kind: "l2"; headerArgs?: unknown };

/**
 * Configuration for the CLOB client
 */
export type ClientConfig = {
  /** Wallet to use for L1 authentication */
  wallet: ConnectedWalletClient;

  /** L2 API credentials (key, secret, passphrase) */
  credentials: Credentials;

  /** Base URL for the CLOB API */
  baseUrl?: string;

  /** Request timeout in milliseconds */
  timeoutMs?: number;

  /** Maximum number of retries for failed requests */
  maxRetries?: number;

  /** Enable debug logging */
  debug?: boolean;
};

export class BaseClient {
  public readonly wallet: ConnectedWalletClient;

  protected readonly credentials: Credentials;
  protected readonly debug: boolean;

  private readonly api: KyInstance;

  constructor({
    wallet,
    credentials,
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    debug = false,
  }: ClientConfig) {
    this.wallet = wallet;
    this.credentials = credentials;
    this.debug = debug;
    this.api = ky.create({
      prefixUrl: baseUrl,
      timeout: timeoutMs,
      retry: {
        limit: maxRetries,
        methods: ["get", "post", "delete"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        backoffLimit: 10000,
      },
      hooks: {
        beforeRequest: [
          (request) => {
            if (this.debug) {
              console.log(`[OrderBookClient] ${request.method} ${request.url}`);
            }
          },
        ],
        beforeRetry: [
          async ({ request, retryCount }) => {
            if (this.debug) {
              console.log(
                `[OrderBookClient] Retry attempt ${retryCount} for ${request.url}`,
              );
            }
          },
        ],
        afterResponse: [
          (request, _options, response) => {
            if (this.debug) {
              console.log(
                `[OrderBookClient] Response ${response.status} from ${request.url}`,
              );
            }
            return response;
          },
        ],
      },
    });
  }

  /**
   * Make an authenticated or unauthenticated HTTP request
   *
   * @param method - HTTP method (GET, POST, DELETE)
   * @param path - Request path
   * @param options - Request options including auth type, body, and params
   * @returns Response data
   */
  public async request<T>({
    method,
    path,
    auth,
    options = {},
  }: {
    method: "GET" | "POST" | "DELETE";
    path: `/${string}`;
    auth: AuthRequirement;
    options?: {
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
    };
  }): Promise<T> {
    const { body, params } = options;

    // Build full path with query params for signature
    const searchParams = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Accept-Encoding": "gzip",
      Connection: "keep-alive",
      "Content-Type": "application/json",
      "User-Agent": "@polys/order-book",
    };

    // Add authentication headers based on auth type
    // auth === "none" requires no additional headers
    if (auth.kind === "l1") {
      // L1 authentication (EIP-712 wallet signature)
      const l1Headers = await createL1Headers({
        signer: this.wallet,
        nonce: BigInt(auth.nonce),
        timestamp: auth.timestamp,
      });

      Object.assign(headers, l1Headers);
    }
    if (auth.kind === "l2") {
      // L2 authentication (HMAC signature with API keys)
      const l2Headers = createL2Headers({
        address: this.wallet.account?.address,
        credentials: this.credentials,
        headerArgs: {
          method,
          requestPath: path,
          body:
            auth.headerArgs !== undefined
              ? JSON.stringify(auth.headerArgs)
              : undefined,
        },
      });

      Object.assign(headers, l2Headers);
    }

    try {
      // remove leading slash because Ky doesn't like it when using prefixUrl
      const normalizedPath = path.replace(/^\//, "");
      const response = await this.api(normalizedPath, {
        method,
        headers,
        json: body,
        searchParams,
      });
      const data = await response.json<T>();

      if (this.debug) {
        console.log("[OrderBookClient] Response data:", data);
      }

      return data;
    } catch (error) {
      // Handle HTTPError
      if (error && typeof error === "object" && "response" in error) {
        const httpError = error as HTTPError;
        const response = httpError.response;
        const statusCode = response.status;

        // Try to parse error details
        let errorDetails: unknown;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = {
            statusText: response.statusText,
            status: response.status,
          };
        }

        // Map HTTP status codes to custom errors
        switch (statusCode) {
          case 400:
            throw new ValidationError(
              "Invalid request parameters",
              errorDetails,
            );
          case 401:
          case 403:
            throw new AuthenticationError(
              "Authentication failed",
              errorDetails,
            );
          case 404:
            throw new ApiError("Resource not found", 404, errorDetails);
          case 429:
            throw new RateLimitError("Rate limit exceeded", errorDetails);
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ApiError("Server error", statusCode, errorDetails);
          default:
            throw new ApiError(`HTTP ${statusCode}`, statusCode, errorDetails);
        }
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new TimeoutError(
          `Request timed out after ${DEFAULT_TIMEOUT_MS}ms`,
        );
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError("Network request failed", error);
      }

      // If it's already one of our custom errors, rethrow
      if (
        error instanceof ApiError ||
        error instanceof AuthenticationError ||
        error instanceof ValidationError ||
        error instanceof RateLimitError ||
        error instanceof TimeoutError ||
        error instanceof NetworkError
      ) {
        throw error;
      }

      // Unknown error
      throw new ApiError(
        "Request failed",
        undefined,
        error instanceof Error ? error.message : error,
      );
    }
  }
}
