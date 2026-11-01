import { parseArgs } from 'node:util';
import { formatHelp } from './lib/common/formatHelp.js';
import { stderr, stdout } from 'node:process';
import { readFile } from 'node:fs/promises';

const STYLE_RESET = '\x1b[0m';
const TEXT_RED = '\x1b[31m';
const TEXT_GREEN = '\x1b[32m';
const TEXT_BLUE = '\x1b[34m';
const TEXT_WHITE = '\x1b[37m';
const BG_RED = '\x1b[41m';

const info = {
  name: 'format-act-log',
  description: 'Format an act log file for readability',
  positionals: 'file_path'
};

const options = {
  help: { type: 'boolean', default: false, short: 'h' }
};

const optionsDetail = {
  help: { summary: 'Print command line options' }
};

const {
  positionals,
  values: { help, ...values }
} = parseArgs({ options, strict: false, allowPositionals: true });

const error = validateInput(positionals, values);

if (help) {
  stderr.write(formatHelp(info, options, optionsDetail));
} else if (error) {
  stdout.write(formatHelp(info, options, optionsDetail));

  throw error;
} else {
  await main(positionals, values);
}

async function main([path]) {
  const file = await readFile(path);

  const json = JSON.parse(file);

  if (!json.testResults || !json.testSessionDetails) {
    throw new Error('invalid log file');
  }

  // header
  if (json.testSessionDetails) {
    stdout.write(TEXT_BLUE);
    stdout.write(`> date: \t${json.testSessionDetails.firstTestDate}\n`);
    Object.entries(json.testSessionDetails.deviceIdentifier || {}).forEach(([key, value]) => {
      stdout.write(`> ${key}:\t${value}\n`);
    });
    stdout.write(STYLE_RESET);
  }

  // results
  let startTime;
  for (const item of json.testResults) {
    const { testId, testUrl, telemetryDetail, eventType, eventTime, eventCounter } = item;

    switch (eventType) {
      case 'started':
        stdout.write(`\n${TEXT_BLUE}> ${testId} (${testUrl})${STYLE_RESET}\n`);
        startTime = eventTime;
        break;
      case 'telemetry':
        stdout.write(
          `${TEXT_BLUE}${(eventTime - startTime).toString().padStart(5, ' ')} ms ${eventCounter.toString().padStart(3, ' ')}: ${STYLE_RESET}`
        );
        if (telemetryDetail.match(/\d+ checks failed. \d+ total:/)) {
          stdout.write(TEXT_BLUE);
        } else if (telemetryDetail.includes('PASS:')) {
          stdout.write(TEXT_GREEN);
        } else if (telemetryDetail.includes('FAIL:')) {
          stdout.write(TEXT_RED);
        }
        stdout.write(`${telemetryDetail}${STYLE_RESET}\n`);
        break;
      case 'finished:error':
        stdout.write(
          `${TEXT_BLUE}${(eventTime - startTime).toString().padStart(5, ' ')} ms ${eventCounter.toString().padStart(3, ' ')}: ${STYLE_RESET}`
        );
        stdout.write(`${BG_RED}${TEXT_WHITE}${telemetryDetail}${STYLE_RESET}\n`);
        break;
    }
  }
}

function validateInput(positionals) {
  const errors = [...validatePositionals(positionals)];
  return errors.length === 0 ? null : new AggregateError(errors, 'Invalid arguments provided');
}

function* validatePositionals(positionals) {
  if (positionals == null || !Array.isArray(positionals)) {
    yield new TypeError(`No arguments provided. (got: ${positionals})`);
  }

  if (positionals.length < 1 || typeof positionals[0] !== 'string') {
    yield new TypeError(`File path not provided. (got: ${positionals[0]})`);
  }
}
