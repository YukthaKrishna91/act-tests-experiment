import { formatTestUrl } from './formatTestUrl.js';
import { readManifest } from './loadManifest.js';

export function formatTestPackEntry(type) {
  return type === 'string' ? formatString : formatManifest;
}

async function formatString({ path, version }) {
  return formatTestUrl({ path, version });
}

async function formatManifest({ path, version }) {
  const manifest = await readManifest(path);

  return {
    test_url: formatTestUrl({ path, version }),
    tags: {
      'spec-requirement': manifest.tags['spec-requirement'],
      'specification-section': manifest.tags['specification-section'],
      'testpack-id': manifest.tags['testpack-id']
    }
  };
}
