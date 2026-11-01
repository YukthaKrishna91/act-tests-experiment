export function logParameters(func) {
  return function log(...parts) {
    console.log(...parts);

    return func(...parts);
  };
}
