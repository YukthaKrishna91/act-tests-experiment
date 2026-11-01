export async function fetchSegmentBuffer(resource, options) {
  const response = await fetch(resource, options);

  if (!response.ok) {
    throw new Error(`[HTTP-${response.status}] ${response.statusText} (${resource})`);
  }

  return response.arrayBuffer();
}
