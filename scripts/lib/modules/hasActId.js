import { realpath } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { readManifest } from '../common/loadManifest.js';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { formatTestUrl } from '../common/formatTestUrl.js';

export async function hasActId(path) {
  const manifestPath = await realpath(path, { encoding: 'utf8' });

  if (basename(manifestPath) !== 'manifest.json') {
    return [
      new TypeError(`Input file path does not look like a manifest. (got ${manifestPath})`, {
        cause: { key: 'notActManifest' }
      }),
      null
    ];
  }

  if (!manifestPath.startsWith(join(CANONICAL_REPO_PATH, 'src'))) {
    return [
      new TypeError(`Input file is outside 'src/'. (got ${manifestPath})`, {
        cause: { key: 'manifestOutsideSrc' }
      }),
      null
    ];
  }

  if (manifestPath.startsWith(join(CANONICAL_REPO_PATH, 'src/_staged'))) {
    return [
      new TypeError(
        `Staged ACT tests should not receive an ID as the ID is based on the file path. (got ${manifestPath})`,
        { cause: { key: 'manifestWithinStaged' } }
      ),
      null
    ];
  }

  const testPath = relative('src', join(manifestPath, '..'));

  const manifest = await readManifest(testPath);

  const testUrl = formatTestUrl({ path: testPath, version: 'latest' });

  const { exists, id: currentId } = await parseTestIdFromResponse(
    await fetch(new URL(`https://certification.bbctvapps.co.uk/act/api/test-id?testUrl=${testUrl}`))
  );

  const idsFromManifest = manifest.tags['testpack-id'];

  if (exists && (idsFromManifest.length === 0 || idsFromManifest[0] !== currentId)) {
    return [
      new TypeError(
        `The local and remote ACT IDs don't match for ${testUrl}. (got local ${idsFromManifest[0]}; remote ${currentId})`,
        { cause: { key: 'testIdsNotEq' } }
      ),
      null
    ];
  }

  return [null, exists];
}

async function parseTestIdFromResponse(response) {
  const { ok, status, url } = response;

  if (!ok && status === 404) {
    return { exists: false, id: null };
  }

  if (!ok) {
    const queryParams = new URL(url).searchParams;

    throw new Error(
      `/act/api/test-id responded with ${status} to the testUrl. (got ${queryParams.get('testUrl')})`
    );
  }

  const json = await response.json();

  // TODO: Check is valid ACT ID?
  if (
    json == null ||
    typeof json !== 'object' ||
    typeof json?.testId !== 'string' ||
    !isValidActId(json.testId)
  ) {
    throw new TypeError(`The ID returned from /act/api/test-id is invalid. (got ${json?.testId})`);
  }

  return {
    exists: true,
    id: json.testId
  };
}

function isValidActId(string) {
  return /^ACT-[0-9]+$/.test(string);
}
