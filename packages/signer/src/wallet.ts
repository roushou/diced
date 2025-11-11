import type { Account, Chain, Transport, WalletClient } from "viem";
import { createWalletClient, http, isHex, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

export type ConnectedWalletClient = WalletClient<Transport, Chain, Account>;

export type SupportedChain = "polygon" | "polygon-amoy";

export function createConnectedWallet({
  privateKey,
  chain,
}: {
  privateKey: string;
  chain: SupportedChain;
}) {
  const normalized = isHex(privateKey) ? privateKey : toHex(privateKey);
  if (normalized.length !== 66) {
    throw new Error(
      "Invalid private key: must be 32 bytes (64 hex characters)",
    );
  }

  return createWalletClient({
    account: privateKeyToAccount(normalized),
    chain: chain === "polygon" ? polygon : polygonAmoy,
    transport: http(),
  });
}
