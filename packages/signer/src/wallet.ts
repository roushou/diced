import type { Account, Chain, Transport, WalletClient } from "viem";
import { createWalletClient, http } from "viem";
import { polygon, polygonAmoy } from "viem/chains";

export type ConnectedWalletClient = WalletClient<Transport, Chain, Account>;

export type SupportedChain = "polygon" | "polygon-amoi";

export function createConnectedWallet({
  account,
  chain,
}: {
  account: `0x${string}` | Account;
  chain: SupportedChain;
}) {
  return createWalletClient({
    account,
    chain: chain === "polygon" ? polygon : polygonAmoy,
    transport: http(),
  });
}
