export function roundTo(value: number, decimals = 0): number {
  const safeDecimals = Math.max(0, decimals);
  const factor = 10 ** safeDecimals;
  return Math.round(value * factor) / factor;
}

export function roundForDisplay(value: number, decimals = 1): number {
  const rounded = roundTo(value, decimals);
  return Object.is(rounded, -0) ? 0 : rounded;
}

export function roundToStep(value: number, step: number): number {
  const safeStep = step > 0 ? step : 1;
  return roundForDisplay(Math.round(value / safeStep) * safeStep, 6);
}
