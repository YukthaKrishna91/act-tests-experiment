export function bin(list, func) {
  const bins = new Map();

  for (const entry of list) {
    const binName = func(entry);

    if (!bins.has(binName)) {
      bins.set(binName, []);
    }

    const bin = bins.get(binName);

    bin.push(entry);
  }

  return bins;
}
