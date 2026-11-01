import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function readFixture(name) {
  return readFile(join(import.meta.dirname, name));
}
