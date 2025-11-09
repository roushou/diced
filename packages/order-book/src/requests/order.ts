import type { BaseClient } from "../base-client.ts";

export class OrderRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get an order by ID
   */
  async getOrder(id: string): Promise<Order> {
    return this.client.request<Order>({
      method: "GET",
      path: `/data/order/${id}`,
      auth: {
        kind: "l2",
      },
    });
  }

  /**
   * List active orders for a given market
   */
  async listOrders(params: ListOrderParams): Promise<Order[]> {
    return this.client.request<Order[]>({
      method: "GET",
      path: "/data/orders",
      auth: { kind: "l2" },
      options: {
        params: {
          id: params?.assetId,
          market: params?.marketId,
          asset: params?.assetId,
        },
      },
    });
  }

  /**
   * Check if an order is eligible or scoring for Rewards purposes
   */
  async checkOrderRewardScoring(id: string): Promise<Order[]> {
    return this.client.request<Order[]>({
      method: "GET",
      path: "/order-scoring",
      auth: { kind: "l2" },
      options: {
        params: { order_id: id },
      },
    });
  }

  /**
   * Create an order
   */
  async createOrder(params: CreateOrderParams): Promise<SignedOrder> {
    return this.client.request<SignedOrder>({
      method: "POST",
      path: "/order",
      auth: { kind: "l2" },
      options: {
        body: params,
      },
    });
  }

  /**
   * Post an order to the order book
   */
  async postOrder(order: SignedOrder): Promise<OrderResponse> {
    return this.client.request<OrderResponse>({
      method: "POST",
      path: "/order",
      auth: { kind: "l2" },
      options: {
        body: order,
      },
    });
  }

  /**
   * Create and post an order in one step
   */
  async createAndPostOrder(params: CreateOrderParams): Promise<OrderResponse> {
    const signedOrder = await this.createOrder(params);
    return this.postOrder(signedOrder);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string): Promise<CancelResponse> {
    return this.client.request<CancelResponse>({
      method: "DELETE",
      path: "/order",
      auth: { kind: "l2" },
      options: {
        body: { orderID: id },
      },
    });
  }

  /**
   * Cancel multiple orders
   */
  async cancelOrders(_orderIds: string[]): Promise<CancelResponse> {
    return this.client.request<CancelResponse>({
      method: "DELETE",
      path: "/orders",
      auth: { kind: "l2" },
    });
  }

  /**
   * Cancel all orders
   */
  async cancelAllOrders(): Promise<CancelResponse> {
    return this.client.request<CancelResponse>({
      method: "DELETE",
      path: "/cancel-all",
      auth: {
        kind: "l2",
      },
    });
  }
}

export type Order = {
  id: string;
  market: string;
  asset_id: string;
  owner: string;
  side: OrderSide;
  size: string;
  original_size: string;
  price: string;
  type: OrderType;
  fee_rate_bps: string;
  status: string;
  created_at?: string;
  last_update?: string;
  outcome?: string;
  expiration?: string;
  maker_address?: string;
  associate_trades?: AssociateTrade[];
};

export type OrderSide = "BUY" | "SELL";

// Good till cancelled | Fill or kill | Good till date
export type OrderType = "GTC" | "FOK" | "GTD";

export type OrderResponse = {
  success: boolean;
  errorMsg?: string;
  orderID?: string;
  transactionsHashes?: string[];
};

export type SignedOrder = {
  salt: number;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  side: OrderSide;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  signatureType: number;
  signature: string;
};

export type ListOrderParams = {
  orderId?: string;
  marketId: string;
  assetId?: string;
};

export type CreateOrderParams = {
  token_id: string;
  price: number;
  side: OrderSide;
  size: number;
  fee_rate_bps?: number;
  nonce?: number;
  expiration?: number;
  taker?: string;
};

export type CancelResponse = {
  success: boolean;
  errorMsg?: string;
};

export type AssociateTrade = {
  id: string;
  order_id: string;
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
  owner?: string;
  maker_address?: string;
  transaction_hash?: string;
};
