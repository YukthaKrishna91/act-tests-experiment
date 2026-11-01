import { realpath } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { formatTestUrl } from '../common/formatTestUrl.js';

export async function buildCustomTestList(paths, { certDomain = 'prod', version = 'latest' } = {}) {
  const realPaths = await Promise.all(paths.map((path) => realpath(path, { encoding: 'utf8' })));
  const pathsInsideSrc = realPaths.filter((path) =>
    path.startsWith(join(CANONICAL_REPO_PATH, 'src'))
  );

  const testPaths = new Set(
    pathsInsideSrc
      .filter((path) => basename(path) === 'manifest.json' || basename(path) === 'payload.js')
      .map((path) => formatTestUrl({ version, path: relative('src', join(path, '..')) }))
  );

  if (testPaths.size === 0) {
    return [
      new TypeError(
        `No monorepo ACT tests provided. (got ${realPaths.length} ${realPaths.length === 1 ? 'path' : 'paths'})`,
        { cause: { paths: realPaths } }
      ),
      null
    ];
  }

  const endpoint =
    certDomain === 'prod' ? 'certification.bbctvapps.co.uk' : 'certification.test.bbctvapps.co.uk';

  const url = new URL(`https://${endpoint}/act/portal/`);

  url.searchParams.append('testList', 'custom');
  url.searchParams.append('customTestList', JSON.stringify([...testPaths]));

  return [null, url];
}
