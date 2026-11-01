import { stdout } from 'node:process';
import { parseArgs } from 'node:util';
import { formatHelp } from '../common/formatHelp.js';
import { hasActId } from './hasActId.js';

const info = {
  name: 'has-act-id',
  description: 'Check the test has an ACT ID',
  positionals: 'manifest (json)'
};

const options = {
  help: { type: 'boolean', default: false, short: 'h' }
};

const optionsDetail = {
  help: { summary: 'print this output' }
};

const {
  positionals,
  values: { help }
} = parseArgs({
  options,
  strict: false,
  allowPositionals: true
});

if (help) {
  stdout.write(formatHelp(info, options, optionsDetail));
} else if (positionals.length !== 1) {
  stdout.write(formatHelp(info, options, optionsDetail));
} else {
  const [path] = positionals;

  await main(path);
}

// LIB:

async function main(path) {
  const [error, hasId] = await hasActId(path);

  if (error) {
    throw error;
  }

  stdout.write(`${hasId ? 'yes' : 'no'}\n`);
}
