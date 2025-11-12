export function roundTo(
  num: number,
  decimals: number,
  mode: "floor" | "ceil" | "round" = "round",
): number {
  const factor = 10 ** decimals;
  return Math[mode](num * factor) / factor;
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
