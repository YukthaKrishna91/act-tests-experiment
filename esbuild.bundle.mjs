#!/usr/bin/env node

import { build, context } from 'esbuild';

/** @type {import("esbuild").BuildOptions} */
const config = {
  bundle: true,
  splitting: false,
  format: 'esm',
  platform: 'neutral',
  outdir: 'bundle',
  outbase: 'src',
  logLevel: 'info',
  entryPoints: [
    'src/**/payload.js',
    'src/**/worker.js',
    'src/**/service-worker.js',
    'src/**/service-worker-end-to-end.js',
    'src/**/manifest.json',
    'src/**/index.html',
    ...['gif', 'jpg', 'png', 'svg', 'wasm', 'woff'].map((blobType) => `src/**/*.${blobType}`)
  ],
  mainFields: ['module', 'browser', 'main'],
  banner: {
    js: "'use strict';"
  },
  loader: {
    '.gif': 'copy',
    '.html': 'copy',
    '.jpg': 'copy',
    '.json': 'copy',
    '.png': 'copy',
    '.svg': 'copy',
    '.wasm': 'copy',
    '.woff': 'copy'
  }
};

await (async () => {
  const mode = process.env.__BUNDLER_MODE;

  if (mode == null) {
    return build(config);
  }

  const buildProcess = await context(config);

  process.addListener('SIGINT', () => buildProcess.dispose());
  process.addListener('SIGQUIT', () => buildProcess.dispose());
  process.addListener('SIGTERM', () => buildProcess.dispose());

  await buildProcess.watch();

  await buildProcess.serve({
    port: 3000,
    host: 'www.sandbox.bbctvapps.co.uk'
  });

  const { default: open } = await import('open');

  open('http://www.sandbox.bbctvapps.co.uk:3000/');
})();
