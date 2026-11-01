import { waitForEvent } from '../event-target/waitForEvent.js';
import { UPDATE_END } from './EventType.js';

/**
 * @param {SourceBuffer} sourceBuffer
 * @param {[number, number]} range - presentation time range to remove
 */
export async function removeBuffer(sourceBuffer, [start, end]) {
  const removed = waitForEvent(sourceBuffer, UPDATE_END);

  sourceBuffer.remove(start, end);

  return removed;
}
