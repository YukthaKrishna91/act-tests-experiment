import { readFile, realpath } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { stdout } from 'node:process';
import { CANONICAL_REPO_PATH } from './lib/common/Repo.js';
import { formatHelp } from './lib/common/formatHelp.js';
import { isValidVersion } from './lib/common/version.js';
import { expandPaths } from './lib/common/expandPaths.js';
import { hasPayloadChanged } from './lib/common/hasPayloadChanged.js';

const STYLE_RESET = '\x1b[0m';
const TEXT_WHITE = '\x1b[37m';
const TEXT_RED = '\x1b[31m';
const TEXT_GREEN = '\x1b[32m';
const TEXT_GREY = '\x1b[90m';

const info = {
  name: 'list-modified-tests',
  description:
    'Lists tests whose payload has changed.\nCompares all built tests by default, use path arguments to limit search to certains directories.',
  positionals: 'paths'
};

const options = {
  version: { type: 'string', default: 'latest', short: 'v' },
  json: { type: 'boolean', default: false, short: 'j' },
  simple: { type: 'boolean', default: false, short: 's' },
  help: { type: 'boolean', default: false, short: 'h' }
};

const optionsDetail = {
  version: {
    summary: 'The published version to compare against. (GitHub Tag or "branch=[branch]")'
  },
  json: { summary: 'Output results as JSON' },
  simple: { summary: 'Output results as a simple list of IDs' },
  help: { summary: 'Print this output' }
};

const {
  positionals,
  values: { help, ...values }
} = parseArgs({ options, strict: false, allowPositionals: true });

const error = validateOptions(values);

if (help) {
  stdout.write(formatHelp(info, options, optionsDetail));
} else if (error) {
  stdout.write(formatHelp(info, options, optionsDetail));

  throw error;
} else {
  await main(positionals, values);
}

function validateOptions(values) {
  const errors = [...validateValues(values), ...validateVersion(values)];

  return errors.length === 0 ? null : new AggregateError(errors, 'Invalid options provided');
}

function* validateValues(values) {
  if (values == null || typeof values !== 'object') {
    yield new TypeError(`No options provided. (got ${values})`);
  }
}

function* validateVersion({ version }) {
  if (!isValidVersion(version)) {
    yield new TypeError(`--version is not a valid version. (got ${version})`);
  }
}

async function main(paths, { version, json, simple }) {
  const pathToSrc = join(CANONICAL_REPO_PATH, 'src');

  const realPaths = await Promise.all(
    (paths.length === 0 ? ['./'] : paths).map((p) => realpath(p, { encoding: 'utf8' }))
  );

  const allPaths = await expandPaths(realPaths);

  const testPaths = allPaths
    .filter((p) => p.startsWith(pathToSrc) && p.endsWith('payload.js'))
    .map((p) => join(relative(pathToSrc, p), '..'));

  const results = await Promise.all(
    testPaths.map(async (testPath) => {
      const changed = await hasPayloadChanged(testPath, version);

      return { testPath, changed };
    })
  );

  const modifiedPaths = results
    .filter(({ changed }) => changed)
    .map(({ testPath }) => `src/${testPath}`);

  const modifiedTests = (
    await Promise.all(
      modifiedPaths.map(async (testPath) => {
        const manifest = JSON.parse(
          await readFile(join(CANONICAL_REPO_PATH, testPath, 'manifest.json'), 'utf-8')
        );
        const testId = manifest.tags['testpack-id'].join(', ');

        return { testPath, testId };
      })
    )
  ).sort((a, b) => a.testPath.localeCompare(b.testPath));

  if (simple) {
    for (const { testId } of modifiedTests) {
      stdout.write(`${testId}\n`);
    }
    return;
  }

  if (json) {
    stdout.write(
      JSON.stringify(
        {
          changesFound: modifiedTests.length > 0,
          comparedToVersion: version,
          changes: modifiedTests.map(({ testPath, testId }) => ({
            id: testId,
            manifestPathSrc: `${testPath}/manifest.json`
          }))
        },
        null,
        2
      )
    );
    return;
  }

  if (modifiedTests.length === 0) {
    stdout.write(
      `${TEXT_GREEN}No built tests have changed compared to version:${STYLE_RESET} ${version}\n\n`
    );
    return;
  }

  stdout.write(
    `${TEXT_RED}The following built tests have changed compared to version:${STYLE_RESET} ${version}\n\n`
  );

  for (const { testPath, testId } of modifiedTests) {
    stdout.write(
      `${TEXT_GREY}> ${TEXT_WHITE}${testId} ${TEXT_GREY}(${testPath}/manifest.json)${STYLE_RESET}\n`
    );
  }

  stdout.write('\n');
}
