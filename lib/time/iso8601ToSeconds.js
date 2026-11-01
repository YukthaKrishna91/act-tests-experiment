const hourInSeconds = 60 * 60;
const dayInSeconds = hourInSeconds * 24;
const yearInSeconds = dayInSeconds * 365;
const monthInSeconds = yearInSeconds / 12;

export function iso8601ToSeconds(duration) {
  if (typeof duration !== 'string') throw new Error('ISO-8601 string expected');

  const regex =
    /P(?:([0-9.]+)Y)?(?:([0-9.]+)M)?(?:([0-9.]+)D)?T?(?:([0-9.]+)H)?(?:([0-9.]+)M)?(?:([0-9.]+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const years = parseFloat(matches[1] || 0);
  const months = parseFloat(matches[2] || 0);
  const days = parseFloat(matches[3] || 0);
  const hours = parseFloat(matches[4] || 0);
  const minutes = parseFloat(matches[5] || 0);
  const seconds = parseFloat(matches[6] || 0);

  let totalSeconds = 0;
  totalSeconds += years * yearInSeconds;
  totalSeconds += months * monthInSeconds;
  totalSeconds += days * dayInSeconds;
  totalSeconds += hours * hourInSeconds;
  totalSeconds += minutes * 60;
  totalSeconds += seconds;

  return totalSeconds;
}
