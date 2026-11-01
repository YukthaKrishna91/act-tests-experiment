import { Buffer } from 'node:buffer';
import { basename, join, relative } from 'node:path';

export function mockFileSystem({ rootDir = import.meta.dirname } = {}) {
  const records = new Map();

  function pathlike(input) {
    if (input instanceof URL) {
      return input.pathname;
    }

    return input;
  }

  function followLink(path, { visited } = {}) {
    const visitedPaths = visited == null ? new WeakSet() : visited;

    if (visitedPaths.has(path)) {
      throw new Error('Cyclic path');
    }

    const next = records.get(path);

    if (next == null) {
      throw new TypeError(`No record provided for path. (got ${path})`);
    }

    if (next.type !== 'link') {
      return path;
    }

    visitedPaths.set(path);

    return followLink(next.target, { visited: visitedPaths });
  }

  function isDirectory(path) {
    return (
      !records.has(path) && [...records.keys()].some((recordPath) => recordPath.startsWith(path))
    );
  }

  function mockFile(target, body) {
    const path = pathlike(target);

    const resolvedPath = path.startsWith('/') ? path : join(rootDir, path);

    records.set(resolvedPath, { body, type: 'file' });
  }

  function mockLink(source, target) {
    const sourcePath = pathlike(source);
    const targetPath = pathlike(target);

    const resolvedSourcePath = sourcePath.startsWith('/') ? sourcePath : join(rootDir, sourcePath);
    const resolvedTargetPath = targetPath.startsWith('/')
      ? targetPath
      : join(resolvedSourcePath, targetPath);

    records.set(resolvedSourcePath, { type: 'link', target: resolvedTargetPath });
  }

  async function mockReadFile(target, options) {
    const path = pathlike(target);

    const resolvedPath = path.startsWith('/') ? path : join(rootDir, path);
    const resolvedEncoding = typeof options === 'string' ? options : options?.encoding;

    if (!records.has(resolvedPath)) {
      throw new TypeError(`No record provided for path. (got ${resolvedPath})`);
    }

    const { type, body } = records.get(resolvedPath);

    if (type !== 'file') {
      throw new TypeError(`No file provided for path. (got ${resolvedPath})`);
    }

    return Promise.resolve(resolvedEncoding == null ? Buffer.from(body) : body);
  }

  async function mockRealPath(target) {
    const path = pathlike(target);

    const resolvedPath = path.startsWith('/') ? path : join(rootDir, path);

    if (isDirectory(resolvedPath)) {
      return resolvedPath;
    }

    const record = records.get(resolvedPath);

    if (record == null) {
      throw new TypeError(`No record provided for path. (got ${resolvedPath})`);
    }

    return record.type === 'link' ? followLink(record.target) : resolvedPath;
  }

  async function mockReadDir(target, options) {
    const path = pathlike(target);

    const resolvedPath = path.startsWith('/') ? path : join(rootDir, path);

    const recursive = typeof options === 'object' && options?.recursive;

    const relativePaths = [...records.keys()]
      .filter((path) => path.startsWith(resolvedPath))
      .map((path) => relative(resolvedPath, path));

    if (recursive) {
      return Promise.resolve(relativePaths);
    }

    const directFiles = relativePaths.filter((path) => path === basename(path));

    return Promise.resolve(directFiles);
  }

  async function mockStat(target) {
    const path = pathlike(target);

    const resolvedPath = path.startsWith('/') ? path : join(rootDir, path);

    const isDir = isDirectory(resolvedPath);

    if (!isDir && !records.has(resolvedPath)) {
      throw new TypeError(`No record provided for path. (got ${resolvedPath})`);
    }

    const type = isDir ? 'directory' : records.get(resolvedPath).type;

    let typeOverrides;

    if (type === 'file') {
      const { body } = records.get(resolvedPath);

      typeOverrides = { size: Buffer.byteLength(body) };
    }

    return {
      isDirectory() {
        return type === 'directory';
      },
      ...typeOverrides
    };
  }

  return { mockFile, mockLink, mockReadDir, mockReadFile, mockRealPath, mockStat };
}
