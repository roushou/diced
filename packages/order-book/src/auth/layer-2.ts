import type { Credentials, Method } from "@polys/signer";
import { createHmacSignature } from "@polys/signer";

/**
 * L2 header payload for API key-based authentication
 */
export type L2HeaderPayload = {
  POLY_ADDRESS: string;
  POLY_SIGNATURE: string;
  POLY_TIMESTAMP: string;
  POLY_API_KEY: string;
  POLY_PASSPHRASE: string;
};

/**
 * Arguments for creating L2 headers
 */
export type L2HeaderArgs = {
  method: Method;
  requestPath: string;
  body?: string;
};

/**
 * Creates L2 authentication headers using HMAC signature
 * Used for all authenticated API requests after obtaining API keys
 *
 * @param credentials - API credentials (key, secret, passphrase)
 * @param headerArgs - Request details for signature generation
 * @param timestamp - Optional timestamp (uses server time if provided)
 * @returns L2 header payload
 */
export function createL2Headers({
  address,
  credentials,
  headerArgs,
  timestamp = Math.floor(Date.now() / 1000),
}: {
  address: string;
  credentials: Credentials;
  headerArgs: L2HeaderArgs;
  timestamp?: number;
}): L2HeaderPayload {
  const signature = createHmacSignature({
    secret: credentials.secret,
    timestamp: timestamp,
    method: headerArgs.method,
    requestPath: headerArgs.requestPath,
    body: headerArgs.body,
  });

  return {
    POLY_ADDRESS: address,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: timestamp.toString(),
    POLY_API_KEY: credentials.key,
    POLY_PASSPHRASE: credentials.passphrase,
  };
}
