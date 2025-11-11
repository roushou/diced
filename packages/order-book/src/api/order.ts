import { type Hex, zeroAddress } from "viem";
import type { BaseClient } from "../base-client.ts";
import { type SignatureType, signOrder } from "../core/eip712.ts";
import { roundTo } from "../utils.ts";
import type { MarketRequests, TickSize } from "./market.ts";

export class OrderRequests {
  constructor(
    private readonly client: BaseClient,
    private readonly market: MarketRequests,
  ) {}

  /**
   * Get an order by ID
   */
  async getOrder(id: string): Promise<OpenOrder> {
    return this.client.request<OpenOrder>({
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
  async listOrders(params: ListOrderParams): Promise<OpenOrder[]> {
    return this.client.request<OpenOrder[]>({
      method: "GET",
      path: "/data/orders",
      auth: { kind: "l2" },
      options: {
        params: {
          id: params?.assetId,
          market: params?.marketId,
          asset_id: params?.assetId,
        },
      },
    });
  }

  /**
   * Check if an order is eligible or scoring for Rewards purposes
   */
  async checkOrderRewardScoring(id: string): Promise<boolean> {
    const response = await this.client.request<{ scoring: boolean }>({
      method: "GET",
      path: "/order-scoring",
      auth: { kind: "l2" },
      options: {
        params: { order_id: id },
      },
    });
    return response.scoring;
  }

  /**
   * Create an order
   */
  async createOrder(params: CreateOrderParams): Promise<SignedOrder> {
    const [tickSize, feeRateBps, nonce] = await Promise.all([
      this.market.getTickSize(params.tokenId),
      this.market.getFeeRateBps(params.tokenId),
      this.getNonce(),
    ]);

    // Build the unsigned order
    const address = this.client.wallet.account.address;
    const amounts = this.calculateOrderAmounts({
      price: params.price,
      side: params.side,
      size: params.size,
      tickSize,
    });
    const order: Order = {
      signer: address,
      maker: address,
      taker: params.taker === "public" ? zeroAddress : params.taker,
      tokenId: params.tokenId,
      nonce: nonce.toString(),
      salt: this.generateSalt().toString(),
      feeRateBps: feeRateBps.toString(),
      expiration: params.expiration.toString(),
      side: params.side,
      signatureType: "eoa",
      makerAmount: amounts.maker,
      takerAmount: amounts.taker,
    };

    // Sign the order
    const signature = await signOrder(this.client.wallet, order);

    return { ...order, signature };
  }

  /**
   * Get the current nonce for the wallet
   */
  private async getNonce(): Promise<bigint> {
    const { account } = this.client.wallet;
    return account.getNonce ? await account.getNonce() : 0n;
  }

  /**
   * Generate a random salt for order uniqueness
   */
  private generateSalt(): bigint {
    return BigInt(Math.round(Math.random() * Date.now()));
  }

  /**
   * Post an order to the order book
   */
  async postOrder(order: SignedOrder): Promise<OrderResponse> {
    return this.client.request<OrderResponse>({
      method: "POST",
      path: "/order",
      auth: {
        kind: "l2",
        headerArgs: {
          deferExec: false,
          order,
        },
      },
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

  private calculateOrderAmounts({
    side,
    size,
    price,
    tickSize,
  }: {
    side: OrderSide;
    size: number;
    price: number;
    tickSize: TickSize;
  }) {
    const tickDecimals = tickSize.split(".")[1]?.length || 0;
    const sizeDecimals = 2;
    const amountDecimals = tickDecimals + sizeDecimals;

    const roundedPrice = roundTo(price, tickDecimals);
    const shares = roundTo(size, sizeDecimals);
    const cost = roundTo(shares * roundedPrice, amountDecimals);

    // Convert to raw integers (no decimals) for smart contract
    // e.g., "2.00" with 6 decimals -> "2000000"
    const sharesRaw = Math.floor(shares * 10 ** sizeDecimals).toString();
    const costRaw = Math.floor(cost * 10 ** amountDecimals).toString();

    if (side === "BUY") {
      // BUY: maker gives USDC, gets shares
      return {
        maker: costRaw,
        taker: sharesRaw,
      };
    } else {
      // SELL: maker gives shares, gets USDC
      return {
        maker: sharesRaw,
        taker: costRaw,
      };
    }
  }
}

export type Order = {
  salt: string;
  maker: Hex;
  signer: Hex;
  taker: Hex;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  expiration: string;
  nonce: string;
  feeRateBps: string;
  side: OrderSide;
  signatureType: SignatureType;
};

export type SignedOrder = Order & { signature: string };

export type OpenOrder = {
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

// Good till cancelled | Fill or kill | Good till date | Fill and kill
export type OrderType = "GTC" | "FOK" | "GTD" | "FAK";

export type OrderResponse = {
  success: boolean;
  errorMsg?: string;
  orderID?: string;
  transactionsHashes?: string[];
};

export type ListOrderParams = {
  orderId?: string;
  marketId: string;
  assetId?: string;
};

export type CreateOrderParams = {
  tokenId: string;
  price: number;
  side: OrderSide;
  size: number;
  expiration: number;
  taker: Hex | "public";
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
