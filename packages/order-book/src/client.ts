import { AccountRequests } from "./api/account.ts";
import { BookRequests } from "./api/book.ts";
import { MarketRequests } from "./api/market.ts";
import { OrderRequests } from "./api/order.ts";
import { TradeRequests } from "./api/trade.ts";
import { AuthRequests } from "./auth/api-keys.ts";
import { BaseClient, type ClientConfig } from "./base-client.ts";

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
  public readonly auth: AuthRequests;

  public readonly book: BookRequests;

  public readonly trade: TradeRequests;

  public readonly market: MarketRequests;

  public readonly order: OrderRequests;

  public readonly account: AccountRequests;

  constructor(config: ClientConfig) {
    super(config);

    this.auth = new AuthRequests(this);
    this.book = new BookRequests(this);
    this.trade = new TradeRequests(this);
    this.market = new MarketRequests(this);
    this.order = new OrderRequests(this, this.market);
    this.account = new AccountRequests(this);
  }
}
