import type { OrderSide } from "./api/order.ts";

export function roundTo(
  num: number,
  decimals: number,
  mode: "floor" | "ceil" | "round" = "round",
): number {
  const factor = 10 ** decimals;
  return Math[mode](num * factor) / factor;
}

/**
 * Convert a price to the contract's raw format
 */
export function priceToRaw(price: number, decimals = 6): string {
  return Math.floor(price * 10 ** decimals).toString();
}

/**
 * Convert a raw price from the contract to a human-readable format
 */
export function rawToPrice(raw: string, decimals = 6): number {
  return Number.parseInt(raw, 10) / 10 ** decimals;
}

/**
 * Convert a size to the contract's raw format
 */
export function sizeToRaw(size: number, decimals = 6): string {
  return Math.floor(size * 10 ** decimals).toString();
}

/**
 * Convert a raw size from the contract to a human-readable format
 */
export function rawToSize(raw: string, decimals = 6): number {
  return Number.parseInt(raw, 10) / 10 ** decimals;
}

/**
 * Calculate the cost of an order (price * size)
 */
export function calculateOrderCost(price: number, size: number): number {
  return price * size;
}

/**
 * Calculate fees for an order
 */
export function calculateFees(
  size: number,
  feeRateBps: number,
  price?: number,
): number {
  const cost = price ? price * size : size;
  return (cost * feeRateBps) / 10000;
}

/**
 * Calculate total cost including fees
 */
export function calculateTotalCost(
  price: number,
  size: number,
  feeRateBps: number,
): number {
  const cost = calculateOrderCost(price, size);
  const fees = calculateFees(size, feeRateBps, price);
  return cost + fees;
}

/**
 * Calculate the spread between bid and ask
 */
export function calculateSpread(bid: number, ask: number): number {
  return ask - bid;
}

/**
 * Calculate the spread as a percentage
 */
export function calculateSpreadPercent(bid: number, ask: number): number {
  const spread = calculateSpread(bid, ask);
  const mid = (bid + ask) / 2;
  return (spread / mid) * 100;
}

/**
 * Calculate the midpoint between bid and ask
 */
export function calculateMidpoint(bid: number, ask: number): number {
  return (bid + ask) / 2;
}

/**
 * Get the opposite side of an order
 */
export function getOppositeSide(side: OrderSide): OrderSide {
  return side === "BUY" ? "SELL" : "BUY";
}

/**
 * Format a token ID for display
 */
export function formatTokenId(tokenId: string): string {
  if (tokenId.length <= 12) {
    return tokenId;
  }
  return `${tokenId.slice(0, 6)}...${tokenId.slice(-6)}`;
}

/**
 * Validate price is within valid range
 */
export function validatePrice(price: number): boolean {
  return price > 0 && price <= 1;
}

/**
 * Validate size is positive
 */
export function validateSize(size: number): boolean {
  return size > 0;
}

/**
 * Round price to tick size
 */
export function roundToTickSize(price: number, tickSize: number): number {
  return Math.round(price / tickSize) * tickSize;
}

/**
 * Check if a price is valid for the given tick size
 */
export function isValidTickSize(price: number, tickSize: number): boolean {
  const rounded = roundToTickSize(price, tickSize);
  return Math.abs(price - rounded) < Number.EPSILON;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
