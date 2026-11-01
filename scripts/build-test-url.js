import { parseArgs } from 'node:util';
import { formatHelp } from './lib/common/formatHelp.js';
import { buildCustomTestList } from './lib/modules/buildCustomTestList.js';
import { stderr, stdout } from 'node:process';
import { isValidVersion } from './lib/common/version.js';

const info = {
  name: 'build-test-url',
  description: 'Compile a custom test list',
  positionals: 'file_paths'
};

const options = {
  'cert-domain': { type: 'string', default: 'prod' },
  help: { type: 'boolean', default: false, short: 'h' },
  version: { type: 'string', default: 'latest' }
};

const optionsDetail = {
  'cert-domain': {
    summary: 'The domain for the url (either "prod" or "test").'
  },
  help: { summary: 'Print this output.' },
  version: {
    summary: 'The version (or branch) for the tests. Prefix a branch name with "branch=".'
  }
};

const {
  positionals,
  values: { help, ...values }
} = parseArgs({ options, strict: false, allowPositionals: true });

const error = validateOptions(values);

if (help) {
  stderr.write(formatHelp(info, options, optionsDetail));
} else if (error) {
  stdout.write(formatHelp(info, options, optionsDetail));

  throw error;
} else {
  await main(positionals, values);
}

async function main(paths, { version, 'cert-domain': certDomain }) {
  const [error, value] = await buildCustomTestList(paths, { certDomain, version });

  if (error != null) {
    throw error;
  }

  stdout.write(`${value.href}\n`);
}

function validateOptions(values) {
  const errors = [...validateValues(values), ...validateDomain(values), ...validateVersion(values)];

  return errors.length === 0 ? null : new AggregateError(errors, 'Invalid options provided');
}

function* validateValues(values) {
  if (values == null || typeof values !== 'object') {
    yield new TypeError(`No options provided. (got ${values})`);
  }
}

function* validateDomain({ 'cert-domain': domain }) {
  if (!['prod', 'test'].includes(domain)) {
    yield new TypeError(`--cert-domain is not a valid Certification domain. (got '${domain}')`);
  }
}

function* validateVersion({ version }) {
  if (!isValidVersion(version)) {
    yield new TypeError(`--version is not a valid version. (got '${version}')`);
  }
}
