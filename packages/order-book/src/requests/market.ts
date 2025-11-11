import type { BaseClient } from "../base-client.ts";

export class MarketRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get market information by condition ID
   */
  async get(conditionId: string): Promise<Market> {
    return this.client.request<Market>({
      method: "GET",
      path: `/markets/${conditionId}`,
      auth: { kind: "none" },
    });
  }

  /**
   * List available markets (paginated)
   */
  async list(nextCursor?: string): Promise<ListMarketsResponse> {
    return this.client.request<ListMarketsResponse>({
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
  async listAll(): Promise<Market[]> {
    const markets: Market[] = [];
    let nextCursor: string | undefined;

    do {
      const response = await this.list(nextCursor);
      markets.push(...response.data);
      nextCursor = response.next_cursor;
    } while (nextCursor);

    return markets;
  }
}

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

export type ListMarketsResponse = {
  data: Market[];
  next_cursor?: string;
  limit: number;
  count: number;
};
