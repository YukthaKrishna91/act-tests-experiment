/* eslint-env browser */

const heavyComputation = (inputParams) => {
  const buffer = [];
  let nofSamples = inputParams.sampleRate * inputParams.duration;
  let halfBuffer = nofSamples / 2;
  let fadeAmplitudeLinearRampStep =
    (inputParams.amplitudeEnd - inputParams.amplitudeStart) / halfBuffer;

  for (var channelIdx = 0; channelIdx < inputParams.numberOfChannels; channelIdx++) {
    const channel = [];
    let result = 0;
    for (var sampleIdx = 0; sampleIdx < nofSamples; sampleIdx++) {
      if (sampleIdx > halfBuffer) {
        result =
          fadeAmplitudeLinearRampStep *
          (nofSamples - sampleIdx) *
          Math.sin((inputParams.frequency * 2.0 * Math.PI * sampleIdx) / inputParams.sampleRate);
      } else {
        result =
          fadeAmplitudeLinearRampStep *
          sampleIdx *
          Math.sin((inputParams.frequency * 2.0 * Math.PI * sampleIdx) / inputParams.sampleRate);
      }
      channel.push(result.toFixed(3));
    }
    buffer.push(channel);
  }

  return buffer;
};

onmessage = function (e) {
  var message = e.data;
  if (typeof message === 'object' && 'port' in message) {
    var response = heavyComputation(message.from);
    message.port.postMessage(response);
  }
};

// eslint-disable-next-line no-unused-vars
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
