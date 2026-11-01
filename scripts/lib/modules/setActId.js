import { realpath } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { formatTestUrl } from '../common/formatTestUrl.js';
import { readManifest } from '../common/loadManifest.js';

export async function setActId(userInterface, path, { dryRun = false } = {}) {
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

  const idsFromManifest = manifest.tags['testpack-id'];

  if (idsFromManifest.length !== 0) {
    return [
      new TypeError(
        `'testpack-id' array in ${testPath}/manifest.json not empty. Please add ids not related to ACT after an ACT ID is generated. (got [${idsFromManifest.join(',')}])`,
        { cause: { key: 'manifestHasTestId' } }
      ),
      null
    ];
  }

  const testUrl = formatTestUrl({ path: testPath, version: 'latest' });

  // source for the font: https://web.archive.org/web/20120819044459/http://www.roysac.com/thedrawfonts-tdf.asp
  // copyright: Public Domain https://web.archive.org/web/20120825063126/http://www.roysac.com/blog/2008/08/copyleft-vs-public-domain
  // font: "Shadow"
  //
  // source for the banner: https://manytools.org/hacker-tools/ascii-banner/ (accessed 2025-10-10)
  // font: "ANSI Shadow"
  const prompt = [
    '',
    '██╗    ██╗ █████╗ ██████╗ ███╗   ██╗██╗███╗   ██╗ ██████╗ ',
    '██║    ██║██╔══██╗██╔══██╗████╗  ██║██║████╗  ██║██╔════╝ ',
    '██║ █╗ ██║███████║██████╔╝██╔██╗ ██║██║██╔██╗ ██║██║  ███╗',
    '██║███╗██║██╔══██║██╔══██╗██║╚██╗██║██║██║╚██╗██║██║   ██║',
    '╚███╔███╔╝██║  ██║██║  ██║██║ ╚████║██║██║ ╚████║╚██████╔╝',
    ' ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ',
    '',
    'This action will write a new entry to the ACT database for',
    `the url '${testUrl}' (based on the test's path).`,
    'This action is irreversible.',
    '',
    'Are you sure you want to continue? (y/n) '
  ].join('\n');

  // ask for confirmation in CLI
  const answer = await userInterface.question(prompt);

  if (!/^y(es)?$/.test(answer)) {
    return [new DOMException('Aborted by user', 'AbortError'), null];
  }

  userInterface.pause();

  const response = await fetch('https://certification.bbctvapps.co.uk/act/api/test-id', {
    method: 'POST',
    body: JSON.stringify({ testUrl }),
    headers: { 'Content-Type': 'application/json' },
    signal: dryRun ? AbortSignal.abort(`Aborted by user. (got dryRun=${dryRun})`) : undefined
  });

  const { ok, status } = response;

  if (!ok) {
    let textResponse;
    try {
      textResponse = await response.text();
    } catch (error) {
      textResponse = `Client error: ${error.name}: ${error.message}`;
    }

    return [
      new Error(`POST:/act/api/test-id responded with ${status} to the testUrl (${testUrl}).`, {
        cause: {
          key: 'postStatusNotOk',
          response: textResponse
        }
      }),
      null
    ];
  }

  const json = await response.json();

  if (
    json == null ||
    typeof json !== 'object' ||
    typeof json?.testId !== 'string' ||
    !isValidActId(json.testId)
  ) {
    return [
      new TypeError(
        `POST:/act/api/test-id responded with an invalid ACT ID. (got ${json?.testId})`,
        { cause: { key: 'postResponseNotOk' } }
      ),
      null
    ];
  }

  const { testId } = json;

  return [null, testId];
}

function isValidActId(string) {
  return /^ACT-[0-9]+$/.test(string);
}
