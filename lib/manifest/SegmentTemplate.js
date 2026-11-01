import { roundToDecimalPlaces } from '../maths/roundToDecimalPlaces.js';

const REPRESENTATION_MATCHER = '$RepresentationID$';
const SEGMENT_MATCHER = /\$Number(?:%0(\d)d)?\$/g;

export function createSegmentTemplate({
  baseUrl,
  duration,
  initTemplate,
  mediaTemplate,
  representationId,
  startNumber
} = {}) {
  if (typeof initTemplate !== 'string' || initTemplate === '') {
    throw new TypeError(`Invalid init segment template: ${initTemplate}.`);
  }

  if (typeof mediaTemplate !== 'string' || !mediaTemplate.match(SEGMENT_MATCHER)) {
    throw new TypeError(
      `Invalid media segment template: ${mediaTemplate}. Must contain ${SEGMENT_MATCHER}`
    );
  }

  if (typeof duration !== 'number' || !Number.isFinite(duration) || duration < 0) {
    throw new TypeError(`Invalid segment duration: ${duration}`);
  }

  const baseUrlString = baseUrl;
  const durationInSeconds = duration;
  const initTemplateString = initTemplate;
  const mediaTemplateString = mediaTemplate;
  const representationIdString = representationId;
  const segmentStartNumber =
    typeof startNumber === 'number' && Number.isFinite(startNumber) && startNumber >= 0
      ? startNumber
      : 1;

  function buildUrl(relativeUrl) {
    return typeof baseUrlString === 'string' ? `${baseUrlString}${relativeUrl}` : relativeUrl;
  }

  function getInitSegment() {
    if (
      (!representationIdString || typeof representationIdString !== 'string') &&
      initTemplateString.includes(REPRESENTATION_MATCHER)
    ) {
      throw new TypeError('Must specify a RepresentationID');
    }

    const relativeUrl = initTemplateString.replaceAll(
      REPRESENTATION_MATCHER,
      representationIdString
    );

    return buildUrl(relativeUrl);
  }

  function buildMediaSegmentUrl(durationsToSegment) {
    const segmentWidthMatch = [...mediaTemplateString.matchAll(SEGMENT_MATCHER)];

    const segmentNumberMinWidthString = segmentWidthMatch[0][1];

    const segmentNumberMinWidth = segmentNumberMinWidthString
      ? Number(segmentNumberMinWidthString)
      : 0;

    const numberPart = `${durationsToSegment + segmentStartNumber}`.padStart(
      segmentNumberMinWidth,
      '0'
    );

    const mediaPart = mediaTemplateString
      .replaceAll(SEGMENT_MATCHER, numberPart)
      .replaceAll(REPRESENTATION_MATCHER, representationIdString);

    return buildUrl(mediaPart);
  }

  function getMediaSegmentForTime(seconds) {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
      throw new TypeError(`Not a valid presentation time. (got '${seconds}')`);
    }

    const durationsToSegment = Math.max(0, Math.floor(seconds / durationInSeconds));

    return buildMediaSegmentUrl(durationsToSegment);
  }

  function* getDurationsForTimeRange([start, end]) {
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < 0 || end < start) {
      throw new TypeError(`Invalid time range: [${start}-${end}]`);
    }

    const [durationsToFirstSegment, durationsToLastSegment] = [
      Math.max(0, Math.floor(start / durationInSeconds)),
      Math.max(0, Math.ceil(end / durationInSeconds))
    ];

    for (
      let durationsSoFar = durationsToFirstSegment;
      durationsSoFar < durationsToLastSegment;
      durationsSoFar += 1
    ) {
      yield durationsSoFar;
    }
  }

  function* getMediaSegmentsForTimeRange(range) {
    for (const durationsToSegment of getDurationsForTimeRange(range)) {
      yield buildMediaSegmentUrl(durationsToSegment);
    }
  }

  /** @deprecated Prefer `getMediaSegmentsForTimeRange` */
  function getMediaSegments(range) {
    return [...getMediaSegmentsForTimeRange(range)];
  }

  /**
   * Gets the start & end presentation time of the segment at the specified time
   *
   * @param {number} seconds - presentation time
   * @param {number} roundStartToDps - decimal places for rounding start time (default: 2)
   *
   * @returns {[number, number]} an array containing the segment's start & end time in seconds
   */
  function getTimeRangeContaining(seconds, roundStartToDps = 2) {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) {
      throw new TypeError(`Not a valid presentation time. (got '${seconds}')`);
    }

    const durationsToSegment = Math.floor(seconds / durationInSeconds);

    const startTime = durationsToSegment * durationInSeconds;

    return [
      roundToDecimalPlaces(startTime, roundStartToDps),
      startTime + durationInSeconds // we cannot safely round the end time
    ];
  }

  /**
   * Get the start and end presentation time for all segments spanning the time range
   *
   * @param {[number, number]} range
   * @param {number} roundStartToDps - decimal places for rounding start time (default: 2)
   *
   * @yields {[number, number]}
   */
  function* getTimeRangesSpanning(range, roundStartToDps = 2) {
    for (const durationsToSegment of getDurationsForTimeRange(range)) {
      const startTime = durationsToSegment * durationInSeconds;

      yield [
        roundToDecimalPlaces(startTime, roundStartToDps),
        startTime + durationInSeconds // we cannot safely round the end time
      ];
    }
  }

  return {
    getInitSegment,
    getMediaSegmentForTime,
    getMediaSegmentsForTimeRange,
    getTimeRangeContaining,
    getTimeRangesSpanning,
    getMediaSegments,
    /** @deprecated Prefer `getTimeRangeContaining` */
    getSegmentRange: getTimeRangeContaining
  };
}
