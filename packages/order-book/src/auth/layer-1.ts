import { type ConnectedWalletClient, signClobAuth } from "@polys/signer";
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
