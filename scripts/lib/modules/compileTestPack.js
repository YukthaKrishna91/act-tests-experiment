import { realpath } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { CANONICAL_REPO_PATH, MONOREPO_PACK_ID } from '../common/Repo.js';
import { bin } from '../common/bin.js';
import { loadTestPack } from '../common/loadTestPack.js';
import { formatTestPackEntry } from '../common/formatTestPack.js';
import { hasPayloadChanged } from '../common/hasPayloadChanged.js';
import { changelogDocumentsVersion } from '../common/changelogDocumentsVersion.js';
import { getTestPath, getTestUrl, getTestVersion } from '../common/parseTestPack.js';
import { expandPaths } from '../common/expandPaths.js';

const pathToSrc = join(CANONICAL_REPO_PATH, 'src');

export async function compileTestPack(
  paths,
  { pack = 'monorepo', version = 'latest', format = 'consistent', includeStaged = false }
) {
  const { tests: prevTests, ...packInfo } = await loadTestPack(pack);

  const resolvedFormat = format === 'consistent' ? parseFormat(prevTests) : format;

  const testsByActRepoPath = bin(prevTests, (entry) =>
    getTestUrl(entry).split('/').slice(0, 4).join('/')
  );

  const realPaths = await Promise.all(paths.map((path) => realpath(path, { encoding: 'utf8' })));

  const filePaths = await expandPaths(realPaths);

  const localTestPaths = filePaths
    .filter((path) => path.startsWith(pathToSrc) && path.endsWith('payload.js'))
    .map((path) => join(relative(pathToSrc, path), '..'));

  const testPathsByBin = bin(localTestPaths, (path) =>
    path.startsWith('_staged') ? 'staged' : 'main'
  );

  const testPaths = testPathsByBin.get('main') ?? [];

  if (includeStaged) {
    testPaths.push(...(testPathsByBin.get('staged') ?? []));
  }

  const formatEntry = formatTestPackEntry(resolvedFormat);

  const monorepoTests = await Promise.allSettled(
    testPaths.map(async (testPath) => {
      return formatEntry({
        path: testPath,
        version: version === 'latest' ? version : await getVersion(testPath, { version, prevTests })
      });
    })
  );

  const errors = monorepoTests
    .filter(({ status }) => status === 'rejected')
    .map(({ reason }) => reason);

  if (errors.length !== 0) {
    return [new AggregateError(errors), null];
  }

  testsByActRepoPath.set(
    MONOREPO_PACK_ID,
    monorepoTests.map(({ value }) => value)
  );

  const output = {
    ...packInfo,
    tests: [...testsByActRepoPath.entries()].reduce(
      (testsSoFar, [, tests]) => [...testsSoFar, ...tests],
      []
    )
  };

  return [null, output];
}

function parseFormat(tests) {
  if (tests.length === 0) {
    return 'object';
  }

  const uniqueTypes = new Set(tests.map((test) => typeof test));

  if (uniqueTypes.size > 1) {
    throw new TypeError(
      `Failed to find a consistent format because there's multiple in the test pack. (got ${uniqueTypes.size})`
    );
  }

  const [format] = [...uniqueTypes];

  return format;
}

async function getVersion(testPath, { prevTests, version }) {
  const prevTest = prevTests.find((entry) => getTestPath(entry) === testPath);

  if (prevTest == null) {
    return version;
  }

  const prevVersion = getTestVersion(prevTest);

  if (prevVersion === version) {
    return version;
  }

  const hasChanged = await hasPayloadChanged(testPath, prevVersion);

  if (hasChanged && !(await changelogDocumentsVersion(testPath, prevVersion))) {
    throw new Error(`${testPath} is missing a changelog entry for ${version}`, {
      cause: {
        key: `${getVersion.name}.undocumentedChange`,
        values: {
          testPath,
          currentVersion: prevVersion
        }
      }
    });
  }

  return hasChanged ? version : prevVersion;
}
