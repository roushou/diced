import { createHmacSignature } from "./sign/hmac.ts";

/**
 * Credentials required for HMAC signature generation
 */
export type Credentials = {
  key: string;
  secret: string;
  passphrase: string;
};

/**
 * Header payload containing signature and metadata for authenticated requests
 */
export type HeaderPayload = {
  timestamp: number;
  signature: string;
  key: string;
  passphrase: string;
};

/**
 * HTTP methods supported for signing
 */
export type Method = "GET" | "POST" | "DELETE";

/**
 * Signer class for creating HMAC-SHA256 signatures for API authentication
 */
export class Signer {
  readonly credentials: Credentials;

  constructor(credentials: Credentials) {
    this.credentials = credentials;
  }

  /**
   * Creates a header payload with HMAC signature for API authentication
   * @param options - Options for creating the header payload
   * @returns Header payload containing signature and authentication details
   */
  public createHeaderPayload({
    method,
    path,
    body,
    timestamp,
  }: {
    method: Method;
    path: string;
    body: string | undefined;
    timestamp: number | undefined;
  }): HeaderPayload {
    const ts = timestamp ?? Math.floor(Date.now() / 1000);
    const signature = createHmacSignature({
      secret: this.credentials.secret,
      timestamp: ts,
      method,
      requestPath: path,
      body,
    });

    return {
      timestamp: ts,
      signature,
      key: this.credentials.key,
      passphrase: this.credentials.passphrase,
    };
  }
}
