import { execFile as execFileCallback } from 'node:child_process';
import { parseArgs, promisify } from 'node:util';
import { stderr, stdout } from 'node:process';
import { formatHelp } from './lib/common/formatHelp.js';
import { isValidVersion } from './lib/common/version.js';
import { compileTestPack } from './lib/modules/compileTestPack.js';

const execFile = promisify(execFileCallback);

const info = {
  name: 'compile-test-list',
  description: 'Compile a test pack with new versions for any tests.',
  positionals: 'paths'
};

const options = {
  format: { type: 'string', default: 'consistent' },
  pack: { type: 'string', default: 'monorepo' },
  version: { type: 'string', default: 'latest' },
  'include-staged': { type: 'boolean', default: false },
  help: { type: 'boolean', default: false, short: 'h' }
};

const optionsDetail = {
  format: { summary: 'One of consistent, string, and object' },
  help: { summary: 'Print this output' },
  'include-staged': { summary: 'Include tests in _staged/' },
  pack: {
    summary: 'Name of the ACT test pack. F.ex. "approved" or "2025_spec_streamlined_runtime_2026.1"'
  },
  version: { summary: 'The newest version in use for the test pack. Remember prefix "v"' }
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
  const errors = [
    ...validateValues(values),
    ...validateFormat(values),
    ...validatePack(values),
    ...validateVersion(values)
  ];

  return errors.length === 0 ? null : new AggregateError(errors, 'Invalid options provided');
}

function* validateValues(values) {
  if (values == null || typeof values !== 'object') {
    yield new TypeError(`No options provided. (got ${values})`);
  }
}

function* validateFormat({ format }) {
  const choices = ['consistent', 'object', 'string'];

  if (!choices.includes(format)) {
    yield new TypeError(`--format is not one of [${choices.join(', ')}]. (got ${format})`);
  }
}

function* validatePack({ pack }) {
  if (typeof pack !== 'string') {
    yield new TypeError(`--pack is not a string. (got ${pack})`);
  }
}

function* validateVersion({ version }) {
  if (!isValidVersion(version)) {
    yield new TypeError(`--version is not a valid version. (got ${version})`);
  }
}

async function main(paths, { pack, version, format, ...options }) {
  const includeStaged = options['include-staged'];

  await execFile('npm', ['run', 'build']);

  const [error, value] = await compileTestPack(paths.length === 0 ? ['./'] : paths, {
    pack,
    version,
    format,
    includeStaged
  });

  if (error != null) {
    if (Array.isArray(error.errors)) {
      stderr.write(
        [
          '## Errors',
          '',
          ...error.errors.map((error) => `  - ${formatError(error, { pack, version })}`),
          '',
          ''
        ].join('\n')
      );
    }

    throw new Error('Failed to compile new entries');
  }

  stdout.write(JSON.stringify(value, null, 2));
}

function formatError(error, context) {
  const { pack } = context;

  const { cause, message } = error;

  switch (cause?.key) {
    case 'getVersion.undocumentedChange': {
      const { testPath, currentVersion } = cause.values;

      return `'${testPath}' is missing a changelog entry for ${currentVersion}. The '${pack}' test list has ${currentVersion} as the current/latest version so it may be documented as "latest" in the manifest's changelog.`;
    }
    default:
      return message;
  }
}
