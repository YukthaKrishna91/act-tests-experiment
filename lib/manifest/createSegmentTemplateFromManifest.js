import { createSegmentTemplate } from './SegmentTemplate.js';

export function createSegmentTemplateFromManifest(
  manifestDocument,
  manifestBaseURL,
  { mediaKind, codecs, sampleRate, bandwidth, width, height }
) {
  const toStringOrUndefined = (val) => (val != null ? String(val) : val);

  const criteria = {
    mediaKind,
    codecs: toStringOrUndefined(codecs),
    sampleRate: toStringOrUndefined(sampleRate),
    bandwidth: toStringOrUndefined(bandwidth),
    width: toStringOrUndefined(width),
    height: toStringOrUndefined(height)
  };

  const representation = findMatchingRepresentation(manifestDocument, criteria);

  if (!representation) {
    throw new Error('Failed to find a representation matching the criteria.', {
      cause: criteria
    });
  }

  const segmentTemplate = findSegmentTemplate(representation);

  if (!segmentTemplate) {
    throw new Error('Failed to find a representation matching the criteria.', {
      cause: criteria
    });
  }

  return formatSegmentTemplateData(segmentTemplate, representation, manifestBaseURL);
}

function findMatchingRepresentation(
  manifestDocument,
  { mediaKind, codecs, sampleRate, bandwidth, width, height }
) {
  const adaptationSets = Array.from(manifestDocument.querySelectorAll('AdaptationSet')).filter(
    (as) => as.getAttribute('contentType') === mediaKind
  );

  for (const adaptationSet of adaptationSets) {
    const representations = Array.from(adaptationSet.querySelectorAll('Representation'));

    for (const representation of representations) {
      if (
        isMatchingRepresentation(representation, adaptationSet, {
          codecs,
          sampleRate,
          bandwidth,
          width,
          height,
          mediaKind
        })
      ) {
        return representation;
      }
    }
  }

  return null;
}

function isMatchingRepresentation(
  representation,
  adaptationSet,
  { codecs, sampleRate, bandwidth, width, height, mediaKind }
) {
  if (representation.getAttribute('bandwidth') !== bandwidth) {
    return false;
  }

  const getAttr = (name) => representation.getAttribute(name) ?? adaptationSet.getAttribute(name);

  if (codecs && getAttr('codecs') !== codecs) {
    return false;
  }

  if (mediaKind === 'video') {
    if (width && representation.getAttribute('width') !== width) return false;
    if (height && representation.getAttribute('height') !== height) return false;
    const frameRate = getAttr('frameRate');
    if (sampleRate && frameRate && frameRate !== sampleRate) {
      return false;
    }
  } else if (mediaKind === 'audio') {
    const audioRate = getAttr('audioSamplingRate');
    if (sampleRate && audioRate && audioRate !== sampleRate) {
      return false;
    }
  }

  return true;
}

function findSegmentTemplate(representation) {
  let currentElement = representation;

  while (currentElement && currentElement.tagName !== 'MPD') {
    const segmentTemplate = currentElement.querySelector(':scope > SegmentTemplate');
    if (segmentTemplate) {
      return segmentTemplate;
    }
    currentElement = currentElement.parentElement;
  }

  return null;
}

function formatSegmentTemplateData(segmentTemplate, representation, manifestBaseURL) {
  const initTemplate = segmentTemplate.getAttribute('initialization');
  const mediaTemplate = segmentTemplate.getAttribute('media');
  const durationInSeconds =
    Number(segmentTemplate.getAttribute('duration')) /
    Number(segmentTemplate.getAttribute('timescale'));
  const representationId = representation.getAttribute('id');

  return createSegmentTemplate({
    initTemplate,
    mediaTemplate,
    representationId,
    startNumber: 1,
    duration: durationInSeconds,
    baseUrl: resolveBaseURL(representation, manifestBaseURL)
  });
}

function* generateBaseUrlParts(element, { baseUrl } = {}) {
  let currentElement = element;

  while (currentElement) {
    const baseUrlEl = currentElement.querySelector(':scope > BaseURL');

    currentElement = currentElement.parentElement;

    if (baseUrlEl == null || baseUrlEl.textContent.trim() === '') {
      continue;
    }

    let urlPart = baseUrlEl.textContent.trim();

    if (urlPart.startsWith('/')) {
      urlPart = urlPart.slice(1);
    }

    if (!urlPart.endsWith('/')) {
      urlPart = `${urlPart}/`;
    }

    yield urlPart;

    // exit early if manifest contains an absolute baseUrl
    if (/^https?:\/\/.*/.test(urlPart)) {
      return;
    }
  }

  const resolvedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  yield resolvedBaseUrl;
}

/**
 * Resolve the base URL using <BaseURL> in the manifest,
 * for a given representation.
 */
function resolveBaseURL(representation, manifestBaseURL) {
  return [...generateBaseUrlParts(representation, { baseUrl: manifestBaseURL })].reverse().join('');
}
