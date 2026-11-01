'use strict';

const result = {
  fetchDefined: typeof fetch === 'function',
  fetchWorked: false
};

if (result.fetchDefined) {
  fetch('./manifest.json')
    .then((response) => {
      result.fetchWorked = response.ok;
      self.postMessage(result);
    })
    .catch(() => {
      self.postMessage(result);
    });
} else {
  self.postMessage(result);
}
