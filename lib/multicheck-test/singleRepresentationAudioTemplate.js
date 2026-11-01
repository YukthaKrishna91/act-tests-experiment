import { createTemplate } from './template.js';

const singleRepresentationAudioTemplateSchema = [
  { key: 'id', required: true },
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

export function createSingleRepresentationAudioTemplate(name, func) {
  const createTest = createTemplate(
    name,
    { values: singleRepresentationAudioTemplateSchema },
    func
  );

  return function createSingleRepresentationAudioTest({ id, audioRepresentation }) {
    const suffix = getNormalisedAudioTestName(audioRepresentation);
    return createTest(suffix, { id, audioRepresentation });
  };
}

/**
 * {codecFamily}-{sampleRate} Hz: {brandwidth} kbps
 */
function getNormalisedAudioTestName(audioRepresentation) {
  const { codecFamily, sampleRate, bandwidth } = audioRepresentation;
  return `${codecFamily}-${sampleRate} Hz: ${bandwidth / 1000} kbps`;
}
