import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { CANONICAL_REPO_PATH } from './Repo.js';

const template = `https://certification.bbctvapps.co.uk/act/test/monorepo/{{version}}/{{path}}/payload.js`;

export async function hasPayloadChanged(path, version) {
  const testPath = path.startsWith('/') ? path.slice(1) : path;

  const remotePayload = await fetchPayload(testPath, version);

  const localPayloadSize = await loadPayloadSize(testPath, version);
  const localPayload = await loadPayload(testPath, version);

  return (
    remotePayload.byteLength !== localPayloadSize ||
    !areUint8ArraysEqual(remotePayload, localPayload)
  );
}

async function fetchPayload(testPath, version) {
  const url = template.replace('{{version}}', version).replace('{{path}}', testPath);

  const response = await fetch(url);

  return response.bytes();
}

async function loadPayloadSize(testPath, version) {
  const stats = await stat(
    join(CANONICAL_REPO_PATH, version === 'v26.0.0' ? 'src' : 'bundle', testPath, 'payload.js'),
    'utf-8'
  );

  return stats.size;
}

async function loadPayload(testPath, version) {
  return readFile(
    join(CANONICAL_REPO_PATH, version === 'v26.0.0' ? 'src' : 'bundle', testPath, 'payload.js')
  );
}

function areUint8ArraysEqual(some, other) {
  // reference and size equality checked already
  // skipping to byte equality
  for (let elementsSoFar = 0; elementsSoFar < some.length; elementsSoFar += 1) {
    if (some[elementsSoFar] !== other[elementsSoFar]) {
      return false;
    }
  }

  return true;
}
