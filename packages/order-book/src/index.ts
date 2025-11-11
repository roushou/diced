export type { BalanceAllowanceResponse } from "./api/account.ts";
export type {
  OrderBookSummary,
  OrderLevel,
  TickerResponse,
} from "./api/book.ts";
export type {
  GetPriceHistoryParams,
  ListMarketsResponse,
  Market,
  MarketPrice,
  MarketToken,
  MidpointResponse,
  PriceResponse,
  TickSize,
} from "./api/market.ts";
export type {
  CancelResponse,
  CreateOrderParams,
  ListOrderParams,
  OpenOrder,
  OrderResponse,
  OrderSide,
  OrderType,
} from "./api/order.ts";
export type {
  ListTradesParams,
  Trade,
  TradesResponse,
} from "./api/trade.ts";
export { createL1Headers, type L1HeaderPayload } from "./auth/layer-1.ts";
export {
  createL2Headers,
  type L2HeaderArgs,
  type L2HeaderPayload,
} from "./auth/layer-2.ts";
export type { ClientConfig } from "./base-client.ts";
export { OrderBookClient } from "./client.ts";
export {
  ApiError,
  AuthenticationError,
  NetworkError,
  OrderBookError,
  RateLimitError,
  TimeoutError,
  ValidationError,
} from "./errors.ts";

export {
  calculateFees,
  calculateMidpoint,
  calculateOrderCost,
  calculateSpread,
  calculateSpreadPercent,
  calculateTotalCost,
  formatTokenId,
  getOppositeSide,
  isValidTickSize,
  priceToRaw,
  rawToPrice,
  rawToSize,
  roundToTickSize,
  sizeToRaw,
  validatePrice,
  validateSize,
} from "./utils.ts";
