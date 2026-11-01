import { createTemplate } from './template.js';

const singleRepresentationVideoTemplateSchema = [
  { key: 'id', required: true },
  {
    key: 'videoRepresentation',
    required: true,
    values: [
      { key: 'codecFamily', required: true },
      { key: 'codecs', required: true },
      { key: 'bitrateControl', required: true },
      { key: 'bandwidth', required: true },
      { key: 'sampleRate', required: true },
      { key: 'width', required: true },
      { key: 'height', required: true },
      { key: 'transferEncoding', required: false }
    ]
  },
  {
    key: 'audioRepresentation',
    required: true,
    values: [
      { key: 'codecFamily', required: true },
      { key: 'codecs', required: true },
      { key: 'bitrateControl', required: true },
      { key: 'bandwidth', required: true },
      { key: 'sampleRate', required: true }
    ]
  }
];

export function createSingleRepresentationVideoTemplate(name, func) {
  const createTest = createTemplate(
    name,
    { values: singleRepresentationVideoTemplateSchema },
    func
  );

  return function createSingleRepresentationVideoTest({
    id,
    videoRepresentation,
    audioRepresentation
  }) {
    const suffix = getNormalisedVideoTestName(videoRepresentation);
    return createTest(suffix, { id, videoRepresentation, audioRepresentation });
  };
}

/**
 * ({transferEncoding}-)?{codecFamily}-{sampleRate}fps-{bitrateControl}: {width}x{height} at {brandwidth} kbps
 */
function getNormalisedVideoTestName(videoRepresentation) {
  const { transferEncoding, codecFamily, sampleRate, bitrateControl, width, height, bandwidth } =
    videoRepresentation;
  const prefix = typeof transferEncoding === 'string' ? `${transferEncoding}-` : '';
  return `${prefix}${codecFamily}-${sampleRate}fps-${bitrateControl}: ${width}x${height} at ${bandwidth / 1000} kbps`;
}
