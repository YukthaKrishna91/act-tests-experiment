import { readManifest } from './loadManifest.js';

export async function changelogDocumentsVersion(testPath, version) {
  const manifest = await readManifest(testPath);

  return (
    Array.isArray(manifest.changelog) &&
    manifest.changelog.some(({ version: someVersion }) => someVersion === version)
  );
}
