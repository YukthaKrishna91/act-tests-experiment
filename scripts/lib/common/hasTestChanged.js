import { join } from 'node:path';
import { CANONICAL_REPO_PATH } from './Repo.js';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

export async function hasTestChanged(testPath, from, to) {
  try {
    await execFile('git', [
      'diff',
      '--quiet',
      `${from}..${to}`,
      '--',
      join(CANONICAL_REPO_PATH, 'src', testPath)
    ]);

    return false;
  } catch {
    return true;
  }
}
