export function formatNumericDifference(num1, num2, decimalPlaced = 3) {
  const difference = num1 - num2;
  const prefix = difference >= 0 ? '+' : '';
  return `${prefix}${difference.toFixed(decimalPlaced)}`;
}
