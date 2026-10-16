/**
 * Leaf colour ramp shared by every tree view.
 * Stops are the lane colours from the ClaimCPU decks: teal (STP), amber (Moderate), red (Non-STP).
 * White text stays readable on all three stops.
 */
const RAMP: [number, number, number][] = [
  [42, 122, 104], // #2a7a68 teal
  [183, 121, 31], // #b7791f amber
  [200, 69, 47], // #c8452f red
];

interface LeafColorOptions {
  /**
   * true  (default): the highest leaf value is red, the lowest is teal.
   * false: reversed. The infinite-canvas view has always coloured high values green,
   *        so it passes false to keep its behaviour.
   */
  highIsRed?: boolean;
}

export function getLeafColor(value: number, min: number, max: number, options: LeafColorOptions = {}): string {
  const { highIsRed = true } = options;
  let normalized = max === min ? 0.5 : (value - min) / (max - min);
  normalized = Math.min(1, Math.max(0, normalized));
  if (!highIsRed) normalized = 1 - normalized;

  const t = normalized * (RAMP.length - 1);
  const i = Math.min(RAMP.length - 2, Math.floor(t));
  const f = t - i;
  const [r, g, b] = RAMP[i].map((c, k) => Math.round(c + (RAMP[i + 1][k] - c) * f));
  return `rgb(${r}, ${g}, ${b})`;
}
