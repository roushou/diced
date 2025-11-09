import { BaseClient, type ClientConfig } from "./base-client.ts";
import { AccountRequests } from "./requests/account.ts";
import { BookRequests } from "./requests/book.ts";
import { OrderRequests } from "./requests/order.ts";
import { PricingRequests } from "./requests/pricing.ts";
import { TradeRequests } from "./requests/trade.ts";

/**
 * Client for interacting with the Polymarket CLOB API
 *
 * @example
 * ```typescript
 * const client = new OrderBookClient({
 *   credentials: {
 *     key: 'your-api-key',
 *     secret: 'your-api-secret',
 *     passphrase: 'your-passphrase',
 *   },
 * });
 *
 * // Access order book data
 * const orderBook = await client.book.getOrderBook('token-id');
 *
 * // Get trades
 * const trades = await client.trade.getTrades({ market: 'market-id' });
 *
 * // Place an order (authenticated)
 * const order = await client.order.createAndPostOrder({
 *   token_id: 'token-id',
 *   price: 0.55,
 *   side: 'BUY',
 *   size: 100,
 * });
 *
 * // Check balance (authenticated)
 * const balance = await client.account.getBalanceAllowance('token-id', 'address');
 * ```
 */
export class OrderBookClient extends BaseClient {
  public readonly book: BookRequests;

  public readonly pricing: PricingRequests;

  public readonly trade: TradeRequests;

  public readonly order: OrderRequests;

  public readonly account: AccountRequests;

  constructor(config: ClientConfig) {
    super(config);

    this.book = new BookRequests(this);
    this.pricing = new PricingRequests(this);
    this.trade = new TradeRequests(this);
    this.order = new OrderRequests(this);
    this.account = new AccountRequests(this);
  }
}
