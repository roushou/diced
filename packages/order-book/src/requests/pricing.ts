import type { BaseClient } from "../base-client.ts";
import type { OrderSide } from "./order.ts";

export class PricingRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get the market price for a specific token and side
   */
  async getPrice(
    tokenId: string,
    side: "BUY" | "SELL",
  ): Promise<PriceResponse> {
    return this.client.request<PriceResponse>({
      method: "GET",
      path: "/price",
      auth: { kind: "none" },
      options: {
        params: { token_id: tokenId, side },
      },
    });
  }

  /**
   * Get market prices for multiple tokens and sides
   */
  async getPrices(
    params: { tokenId: string; side: OrderSide }[],
  ): Promise<PriceResponse> {
    // TODO: use correct type
    return this.client.request<PriceResponse>({
      method: "POST",
      path: "/prices",
      auth: { kind: "none" },
      options: {
        body: params.map((param) => ({
          token_id: param.tokenId,
          side: param.side,
        })),
      },
    });
  }

  /**
   * Get midpoint price for a specific token
   */
  async getMidpoint(tokenId: string): Promise<MidpointResponse> {
    return this.client.request<MidpointResponse>({
      method: "GET",
      path: "/midpoint",
      auth: { kind: "none" },
      options: {
        params: { token_id: tokenId },
      },
    });
  }
}

export type PriceResponse = {
  price: string;
};

export type MidpointResponse = {
  mid: string;
};
