export function roundToDecimalPlaces(number, decimalPlaces = 1) {
  if (decimalPlaces === 0) return number;
  const multiplier = 10 ** decimalPlaces;
  return Math.round(number * multiplier) / multiplier;
}
