import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

export async function expandPaths(paths) {
  const tree = await Promise.all(
    paths.map(async (path) => {
      const statResult = await stat(path, { encoding: 'utf-8' });

      if (!statResult.isDirectory()) {
        return path;
      }

      const files = await readdir(path, { recursive: true });

      return files.map((relativePath) => join(path, relativePath));
    })
  );

  return [...new Set(tree.flat())];
}
