export function getTestPath(entry) {
  const url = getTestUrl(entry);

  const parts = url.split('/');

  return parts.slice(5, -1).join('/');
}

export function getTestUrl(entry) {
  return typeof entry === 'string' ? entry : entry.test_url;
}

export function getTestVersion(entry) {
  const url = getTestUrl(entry);

  const parts = url.split('/');

  return parts.at(4);
}
