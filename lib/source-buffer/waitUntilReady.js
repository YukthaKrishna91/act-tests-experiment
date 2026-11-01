import { waitForEvent } from '../event-target/waitForEvent.js';

export async function waitUntilReady(sourceBuffer) {
  if (!sourceBuffer.updating) {
    return;
  }

  return waitForEvent(sourceBuffer, 'updateend');
}
