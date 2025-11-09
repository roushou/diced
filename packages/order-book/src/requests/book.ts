import type { BaseClient } from "../base-client.ts";
import type { OrderSide } from "./order.ts";

export class BookRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get order book for a specific token
   */
  async getOrderBook(tokenId: string): Promise<OrderBookSummary> {
    return this.client.request<OrderBookSummary>({
      method: "GET",
      path: "/book",
      auth: { kind: "none" },
      options: {
        params: { token_id: tokenId },
      },
    });
  }

  /**
   * Get multiple order books
   */
  async getOrderBooks(
    params: { tokenId: string; side: OrderSide }[],
  ): Promise<OrderBookSummary[]> {
    return this.client.request<OrderBookSummary[]>({
      method: "POST",
      path: "/books",
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
   * Get ticker information for a token
   */
  async getTicker(tokenId: string): Promise<TickerResponse> {
    return this.client.request<TickerResponse>({
      method: "GET",
      path: "/ticker",
      auth: { kind: "none" },
      options: {
        params: { token_id: tokenId },
      },
    });
  }

  /**
   * Get market information by condition ID
   */
  async getMarket(conditionId: string): Promise<Market> {
    return this.client.request<Market>({
      method: "GET",
      path: `/markets/${conditionId}`,
      auth: { kind: "none" },
    });
  }

  /**
   * Get all available markets (paginated)
   */
  async getMarkets(nextCursor?: string): Promise<MarketsResponse> {
    return this.client.request<MarketsResponse>({
      method: "GET",
      path: "/markets",
      auth: { kind: "none" },
      options: {
        params: { next_cursor: nextCursor },
      },
    });
  }

  /**
   * Get all markets (fetches all pages)
   */
  async getAllMarkets(): Promise<Market[]> {
    const markets: Market[] = [];
    let nextCursor: string | undefined;

    do {
      const response = await this.getMarkets(nextCursor);
      markets.push(...response.data);
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return markets;
  }
}

export type OrderLevel = {
  price: string;
  size: string;
};

export type OrderBookSummary = {
  market: string;
  asset_id: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  timestamp: number;
  hash: string;
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
};

export type Market = {
  condition_id: string;
  question_id: string;
  tokens: MarketToken[];
  rewards?: {
    min_size: string;
    max_spread: string;
    event_start_date?: string;
    event_end_date?: string;
    rates?: number[];
  };
  minimum_order_size: string;
  minimum_tick_size: string;
  description: string;
  category?: string;
  end_date_iso?: string;
  game_start_time?: string;
  question?: string;
  market_slug?: string;
  min_incentive_size?: string;
  max_incentive_spread?: string;
  active?: boolean;
  closed?: boolean;
  seconds_delay?: number;
  icon?: string;
  neg_risk?: boolean;
  neg_risk_market_id?: string;
  neg_risk_request_id?: string;
};

export type MarketToken = {
  token_id: string;
  outcome: string;
  price?: string;
  winner?: boolean;
};

export type MarketsResponse = {
  data: Market[];
  next_cursor?: string;
  count?: number;
};

export type TickerResponse = {
  token_id: string;
  market: string;
  last_price?: string;
  bid?: string;
  ask?: string;
  mid?: string;
  volume?: string;
  timestamp: number;
};
