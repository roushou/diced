import type { ConnectedWalletClient, Credentials, Method } from "@polys/signer";
import { createHmacSignature, signClobAuth } from "@polys/signer";
import type { Hex } from "viem";

/**
 * L1 header payload for wallet-based authentication
 */
export type L1HeaderPayload = {
  POLY_ADDRESS: string;
  POLY_SIGNATURE: Hex;
  POLY_TIMESTAMP: string;
  POLY_NONCE: string;
};

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
 * Creates L1 authentication headers using wallet signature (EIP-712)
 * Used for creating/deriving API keys
 *
 * @param signer - Account to sign with
 * @param nonce - Nonce for the signature (optional, defaults to random)
 * @param timestamp - Timestamp for the signature (optional, uses server time if provided)
 * @returns L1 header payload
 */
export async function createL1Headers({
  signer,
  nonce = BigInt(0),
  timestamp = Math.floor(Date.now() / 1000),
}: {
  signer: ConnectedWalletClient;
  nonce?: bigint;
  timestamp?: number;
}): Promise<L1HeaderPayload> {
  const signature = await signClobAuth({ signer, timestamp, nonce });
  return {
    POLY_ADDRESS: signer.account.address,
    POLY_SIGNATURE: signature,
    POLY_TIMESTAMP: timestamp.toString(),
    POLY_NONCE: nonce.toString(),
  };
}

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
