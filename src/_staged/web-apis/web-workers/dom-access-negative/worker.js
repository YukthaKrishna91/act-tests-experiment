'use strict';

const results = {
  hasWindow: typeof window !== 'undefined',
  hasDocument: typeof document !== 'undefined'
};

self.postMessage(results);
