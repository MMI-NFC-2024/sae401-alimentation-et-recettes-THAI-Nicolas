// Permet de corriger les problèmes d'arrondi en affichage (ex: 0.1 + 0.2 = 0.30000000000000004)
export function roundTo(value: number, decimals = 0): number {
  const safeDecimals = Math.max(0, decimals);
  const factor = 10 ** safeDecimals;
  return Math.round(value * factor) / factor;
}

// Fonction qui évite d'afficher -0 à cause des problèmes d'arrondi, en le remplaçant par 0
export function roundForDisplay(value: number, decimals = 1): number {
  const rounded = roundTo(value, decimals);
  return Object.is(rounded, -0) ? 0 : rounded;
}

//Fonction qui arrondit une valeur au multiple de step le plus proche
export function roundToStep(value: number, step: number): number {
  const safeStep = step > 0 ? step : 1;
  return roundForDisplay(Math.round(value / safeStep) * safeStep, 6);
}
