import type { Account, Chain, Transport, WalletClient } from "viem";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon, polygonAmoy } from "viem/chains";

export type ConnectedWalletClient = WalletClient<Transport, Chain, Account>;

export type SupportedChain = "polygon" | "polygon-amoy";

export function createConnectedWallet({
  privateKey,
  chain,
}: {
  privateKey: `0x${string}`;
  chain: SupportedChain;
}) {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: chain === "polygon" ? polygon : polygonAmoy,
    transport: http(),
  });
}
