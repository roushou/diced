import crypto from "crypto";

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
    const signature = this.createHmacSignature({
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

  /**
   * Creates an HMAC-SHA256 signature using the provided secret and request details
   * @param secret - Base64-encoded secret key
   * @param timestamp - Unix timestamp in seconds
   * @param method - HTTP method
   * @param requestPath - Request path
   * @param body - Request body or undefined
   * @returns URL-safe base64-encoded signature
   */
  private createHmacSignature({
    secret,
    timestamp,
    method,
    requestPath,
    body,
  }: {
    secret: string;
    timestamp: number;
    method: Method;
    requestPath: string;
    body: string | undefined;
  }): string {
    let message = timestamp + method + requestPath;
    if (body !== undefined) {
      message += body;
    }

    const base64Secret = Buffer.from(secret, "base64");
    const hmac = crypto.createHmac("sha256", base64Secret);
    const signature = hmac.update(message).digest("base64");

    // Convert to URL-safe base64 encoding while keeping "=" suffix
    const signatureUrlSafe = signature.replace(/\+/g, "-").replace(/\//g, "_");

    return signatureUrlSafe;
  }
}
