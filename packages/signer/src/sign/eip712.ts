import type { Hex } from "viem";
import type { ConnectedWalletClient } from "../wallet.ts";

/**
 * Signs the canonical Polymarket CLOB EIP-712 authentication message
 *
 * @param signer - Viem wallet client
 * @param timestamp - Timestamp for the signature
 * @param nonce - Nonce for the signature
 * @returns EIP-712 signature
 */
export async function signClobAuth({
  signer,
  timestamp,
  nonce,
}: {
  signer: ConnectedWalletClient;
  timestamp: number;
  nonce: bigint;
}): Promise<Hex> {
  return signer.signTypedData({
    domain: {
      name: "ClobAuthDomain",
      version: "1",
      chainId: signer.chain.id,
    },
    types: {
      ClobAuth: [
        { name: "address", type: "address" },
        { name: "timestamp", type: "string" },
        { name: "nonce", type: "uint256" },
        { name: "message", type: "string" },
      ],
    },
    primaryType: "ClobAuth",
    message: {
      address: signer.account.address,
      timestamp: timestamp.toString(),
      nonce,
      message: "This message attests that I control the given wallet",
    },
  });
}
