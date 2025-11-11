export type {
  L1HeaderPayload,
  L2HeaderArgs,
  L2HeaderPayload,
} from "./auth/headers.ts";
export { createL1Headers, createL2Headers } from "./auth/headers.ts";
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
export type { BalanceAllowanceResponse } from "./requests/account.ts";
export type {
  OrderBookSummary,
  OrderLevel,
  TickerResponse,
} from "./requests/book.ts";
export type {
  GetPriceHistoryParams,
  ListMarketsResponse,
  Market,
  MarketPrice,
  MarketToken,
  MidpointResponse,
  PriceResponse,
  TickSize,
} from "./requests/market.ts";
export type {
  CancelResponse,
  CreateOrderParams,
  ListOrderParams,
  OpenOrder,
  OrderResponse,
  OrderSide,
  OrderType,
} from "./requests/order.ts";
export type {
  ListTradesParams,
  Trade,
  TradesResponse,
} from "./requests/trade.ts";

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
