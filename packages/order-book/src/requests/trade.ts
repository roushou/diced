import type { BaseClient } from "../base-client.ts";
import type { OrderSide } from "./order.ts";

export class TradeRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * List trades
   */
  async listTrades(params?: ListTradesParams): Promise<TradesResponse> {
    return this.client.request<TradesResponse>({
      method: "GET",
      path: "/trades",
      auth: { kind: "none" },
      options: { params },
    });
  }

  /**
   * List all trades for a market
   */
  async listAllTrades(market: string): Promise<Trade[]> {
    const trades: Trade[] = [];
    let nextCursor: string | undefined;

    do {
      const response = await this.listTrades({
        market,
        next_cursor: nextCursor,
      });
      trades.push(...response.data);
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return trades;
  }
}

export type Trade = {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: OrderSide;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time?: string;
  last_update?: string;
  outcome?: string;
  bucket_index?: number;
  owner?: string;
  maker_address?: string;
  transaction_hash?: string;
  trader_side?: OrderSide;
  type?: string;
};

export type ListTradesParams = {
  market?: string;
  maker_address?: string;
  asset_id?: string;
  next_cursor?: string;
  limit?: number;
  before?: number;
  after?: number;
};

export type TradesResponse = {
  data: Trade[];
  next_cursor?: string;
};
