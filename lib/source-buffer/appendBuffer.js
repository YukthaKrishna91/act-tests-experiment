import { waitForEvent } from '../event-target/waitForEvent.js';
import { UPDATE_END } from './EventType.js';

export async function appendBuffer(sourceBuffer, buffer) {
  const appended = waitForEvent(sourceBuffer, UPDATE_END);

  sourceBuffer.appendBuffer(buffer);

  return appended;
}
