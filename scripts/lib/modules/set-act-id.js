import { stderr, stdin, stdout } from 'node:process';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline/promises';
import { formatHelp } from '../common/formatHelp.js';
import { setActId } from './setActId.js';

const info = {
  name: 'act-set-id',
  description: 'Set the ACT ID for your test',
  positionals: 'manifest (json)'
};

const options = {
  'dry-run': { type: 'boolean', default: false },
  help: { type: 'boolean', default: false, short: 'h' }
};

const optionsDetail = {
  'dry-run': 'Abort before updating the ACT testId database',
  help: { summary: 'print this output' }
};

const {
  positionals,
  values: { help, ...values }
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

  const userInterface = createInterface({ input: stdin, output: stderr });

  try {
    await main(userInterface, path, values);
  } finally {
    userInterface.close();
  }
}

// LIB:

async function main(userInterface, path, options) {
  const dryRun = options['dry-run'] ?? false;

  const [error, actId] = await setActId(userInterface, path, { dryRun });

  if (error) {
    throw error;
  }

  stdout.write(`${actId}\n`);
}
