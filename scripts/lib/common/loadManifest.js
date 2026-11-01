import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CANONICAL_REPO_PATH } from './Repo.js';

export async function readManifest(testPath) {
  const contents = await readFile(
    join(CANONICAL_REPO_PATH, 'bundle', testPath, 'manifest.json'),
    'utf-8'
  );

  return JSON.parse(contents);
}
