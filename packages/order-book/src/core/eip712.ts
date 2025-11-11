import type { ConnectedWalletClient } from "@polys/signer";
import type { Hex } from "viem";
import type { Order, OrderSide } from "../api/order.ts";
import { getContractForChain } from "./contracts.ts";

export type SignatureType = "eoa" | "poly-proxy" | "poly-gnosis-safe";

/**
 * Sign an order using EIP-712
 */
export async function signOrder(
  wallet: ConnectedWalletClient,
  order: Order,
): Promise<string> {
  const contract = getContractForChain(wallet.chain.id);

  return wallet.signTypedData({
    primaryType: "Order",
    domain: {
      name: "Polymarket CTF Exchange",
      version: "1",
      chainId: BigInt(wallet.chain.id),
      // TODO: allow to switch between negRiskExchange or not
      verifyingContract: contract.negRiskExchange as Hex,
    },
    // EIP-712 Type definitions for Polymarket orders
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "signer", type: "address" },
        { name: "taker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "side", type: "uint8" },
        { name: "signatureType", type: "uint8" },
      ],
    },
    message: {
      salt: BigInt(order.salt),
      signer: order.signer,
      maker: order.maker,
      taker: order.taker,
      tokenId: BigInt(order.tokenId),
      nonce: BigInt(order.nonce),
      feeRateBps: BigInt(order.feeRateBps),
      expiration: BigInt(order.expiration),
      side: orderSideToNumber(order.side),
      signatureType: signatureTypeToNumber(order.signatureType),
      makerAmount: BigInt(order.makerAmount),
      takerAmount: BigInt(order.takerAmount),
    },
  });
}

function signatureTypeToNumber(signatureType: SignatureType): 0 | 1 | 2 {
  switch (signatureType) {
    case "eoa":
      return 0;
    case "poly-proxy":
      return 1;
    case "poly-gnosis-safe":
      return 2;
  }
}

function orderSideToNumber(side: OrderSide): 0 | 1 {
  return side === "BUY" ? 0 : 1;
}
