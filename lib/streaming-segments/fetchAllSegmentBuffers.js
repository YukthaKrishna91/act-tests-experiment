import { fetchSegmentBuffer } from './fetchSegmentBuffer.js';

export async function fetchAllSegmentBuffers(resources, options) {
  const segmentBuffers = [];

  // Avoid Iterator#map EMCA 2025/16
  // https://bbcpartnerships.atlassian.net/browse/BTM-2
  // https://bbc.atlassian.net/browse/BADGER-384
  for (const resource of resources) {
    segmentBuffers.push(fetchSegmentBuffer(resource, options));
  }

  return Promise.all(segmentBuffers);
}
