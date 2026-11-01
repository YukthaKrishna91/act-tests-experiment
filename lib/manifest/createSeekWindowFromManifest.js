import { iso8601ToSeconds } from '../time/iso8601ToSeconds.js';
import { SeekWindow } from './SeekWindow.js';

/**
 * Creates a seekable window
 * - For vods, the current posix time will represent the presentation time at vod's duration
 *
 * @param {Document} manifestDocument
 *
 * @returns {SeekWindow} providing methods to translate from posix to presentation time
 */
export function createSeekWindowFromManifest(manifestDocument, { freezeWindow = true } = {}) {
  const rootElement = manifestDocument.querySelector('MPD');

  const streamType = rootElement.getAttribute('type');

  // stream types like: webcasts & simulcasts
  if (streamType === 'dynamic') {
    const availabilityStartTimeInMillis = Date.parse(
      rootElement.getAttribute('availabilityStartTime')
    );

    if (
      typeof availabilityStartTimeInMillis !== 'number' ||
      !Number.isFinite(availabilityStartTimeInMillis)
    ) {
      throw new TypeError(
        `Availability start time is not a date. (got ${rootElement.getAttribute('availabilityStartTime')})`
      );
    }

    const timeShiftBufferDepth = rootElement.getAttribute('timeShiftBufferDepth');

    return new SeekWindow({
      posixStart:
        timeShiftBufferDepth == null
          ? availabilityStartTimeInMillis
          : () => {
              const now = Date.now();
              const timeShiftBufferDepthInMillis = iso8601ToSeconds(timeShiftBufferDepth) * 1000;

              const isSliding = now - timeShiftBufferDepthInMillis > availabilityStartTimeInMillis;

              return isSliding ? now - timeShiftBufferDepthInMillis : availabilityStartTimeInMillis;
            },
      posixEnd: freezeWindow ? Date.now() : () => Date.now(),
      posixOffset: availabilityStartTimeInMillis
    });
  }

  // static streams like: on demand
  if (streamType === 'static') {
    const duration = rootElement.getAttribute('mediaPresentationDuration');

    if (!duration) throw new Error("vod's expect a mediaPresentationDuration");

    const durationInMillis = iso8601ToSeconds(duration) * 1000;

    if (typeof durationInMillis !== 'number' || !Number.isFinite(durationInMillis)) {
      throw new TypeError(
        `Media presentation duration is not an ISO8601 duration. (got ${rootElement.getAttribute('mediaPresentationDuration')})`
      );
    }
    return new SeekWindow({
      posixStart: freezeWindow
        ? Date.now() - durationInMillis
        : () => Date.now() - durationInMillis,
      posixEnd: freezeWindow ? Date.now() : () => Date.now()
    });
  }

  throw new TypeError(`Invalid type in manifest. (got ${streamType})`);
}
