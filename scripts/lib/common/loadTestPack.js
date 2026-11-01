import { readFile } from 'node:fs/promises';

export function buildTestPackUrl(name) {
  return new URL(`/act/api/testpacks/${name}`, 'https://certification.bbctvapps.co.uk');
}

export async function loadTestPack(descriptor) {
  if (descriptor.startsWith('file://')) {
    return readTestPack(new URL(descriptor));
  }

  if (descriptor.startsWith('https://')) {
    return fetchTestPack(new URL(descriptor));
  }

  return fetchTestPack(buildTestPackUrl(descriptor));
}

export async function fetchTestPack(resource) {
  const response = await fetch(resource);

  return response.json();
}

export async function readTestPack(path) {
  const contents = await readFile(path, { encoding: 'utf8' });

  return JSON.parse(contents);
}
