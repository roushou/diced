import crypto from "crypto";
import type { Method } from "../signer.ts";

/**
 * Creates an HMAC-SHA256 signature using the provided secret and request details
 *
 * @param secret - Base64-encoded secret key
 * @param timestamp - Unix timestamp in seconds
 * @param method - HTTP method
 * @param requestPath - Request path
 * @param body - Request body or undefined
 * @returns URL-safe base64-encoded signature
 */
export function createHmacSignature({
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
