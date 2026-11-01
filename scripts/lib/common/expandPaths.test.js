import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { CANONICAL_REPO_PATH } from './Repo.js';
import { mockFileSystem } from './mockFileSystem.js';

describe('expand paths', () => {
  const mockReadDir = mock.fn();
  const mockReadFile = mock.fn();
  const mockStat = mock.fn();

  let expandPaths;
  let mockFile;

  before(async () => {
    mock.module('node:fs/promises', {
      namedExports: {
        readdir: mockReadDir,
        readFile: mockReadFile,
        stat: mockStat
      }
    });

    ({ expandPaths } = await import('./expandPaths.js'));
  });

  beforeEach(() => {
    const {
      mockFile: mockFileImpl,
      mockReadDir: mockReadDirImpl,
      mockReadFile: mockReadFileImpl,
      mockStat: mockStatImpl
    } = mockFileSystem({ rootDir: CANONICAL_REPO_PATH });

    mockReadDir.mock.mockImplementation(mockReadDirImpl);
    mockReadFile.mock.mockImplementation(mockReadFileImpl);
    mockStat.mock.mockImplementation(mockStatImpl);

    mockFile = mockFileImpl;
  });

  it('returns files', async () => {
    mockFile('src/maths/02-plus-02-eq-04/payload.js', '');
    mockFile('src/maths/09-plus-10-eq-21/payload.js', '');

    assert.deepEqual(
      await expandPaths([
        'src/maths/02-plus-02-eq-04/payload.js',
        'src/maths/09-plus-10-eq-21/payload.js'
      ]),
      ['src/maths/02-plus-02-eq-04/payload.js', 'src/maths/09-plus-10-eq-21/payload.js']
    );
  });

  it('expands a directory to files within the directory', async () => {
    mockFile('src/maths/02-plus-02-eq-04/payload.js', '');
    mockFile('src/maths/09-plus-10-eq-21/payload.js', '');

    assert.deepEqual(await expandPaths(['src/maths']), [
      'src/maths/02-plus-02-eq-04/payload.js',
      'src/maths/09-plus-10-eq-21/payload.js'
    ]);
  });

  it('takes files and directories', async () => {
    mockFile('src/maths/02-plus-02-eq-04/payload.js', '');
    mockFile('src/maths/09-plus-10-eq-21/payload.js', '');
    mockFile('src/letters/a-before-b/payload.js', '');
    mockFile('src/letters/b-before-c/payload.js', '');

    assert.deepEqual(
      await expandPaths([
        'src/maths/02-plus-02-eq-04/payload.js',
        'src/letters',
        'src/maths/09-plus-10-eq-21/payload.js'
      ]),
      [
        'src/maths/02-plus-02-eq-04/payload.js',
        'src/letters/a-before-b/payload.js',
        'src/letters/b-before-c/payload.js',
        'src/maths/09-plus-10-eq-21/payload.js'
      ]
    );
  });

  it('takes multiple directories', async () => {
    mockFile('src/maths/02-plus-02-eq-04/payload.js', '');
    mockFile('src/maths/09-plus-10-eq-21/payload.js', '');
    mockFile('src/letters/a-before-b/payload.js', '');
    mockFile('src/letters/b-before-c/payload.js', '');

    assert.deepEqual(await expandPaths(['src/letters', 'src/maths']), [
      'src/letters/a-before-b/payload.js',
      'src/letters/b-before-c/payload.js',
      'src/maths/02-plus-02-eq-04/payload.js',
      'src/maths/09-plus-10-eq-21/payload.js'
    ]);
  });

  it('removes duplicates', async () => {
    mockFile('src/maths/02-plus-02-eq-04/payload.js', '');
    mockFile('src/maths/09-plus-10-eq-21/payload.js', '');

    assert.deepEqual(await expandPaths(['src/maths/02-plus-02-eq-04/payload.js', 'src/maths']), [
      'src/maths/02-plus-02-eq-04/payload.js',
      'src/maths/09-plus-10-eq-21/payload.js'
    ]);
  });
});
