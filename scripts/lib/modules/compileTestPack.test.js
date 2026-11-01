import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { mockFileSystem } from '../common/mockFileSystem.js';

await describe('compileTestPack', async () => {
  const mockReadDir = mock.fn();
  const mockReadFile = mock.fn();
  const mockRealPath = mock.fn();
  const mockStat = mock.fn();

  let agent;
  let compileTestPack;
  let mockFile;

  before(async () => {
    mock.module('node:fs/promises', {
      namedExports: {
        readdir: mockReadDir,
        readFile: mockReadFile,
        realpath: mockRealPath,
        stat: mockStat
      }
    });

    ({ compileTestPack } = await import('./compileTestPack.js'));
  });

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
    setGlobalDispatcher(agent);

    const {
      mockFile: mockFileImpl,
      mockReadDir: mockReadDirImpl,
      mockReadFile: mockReadFileImpl,
      mockRealPath: mockRealPathImpl,
      mockStat: mockStatImpl
    } = mockFileSystem({ rootDir: CANONICAL_REPO_PATH });

    mockReadDir.mock.mockImplementation(mockReadDirImpl);
    mockReadFile.mock.mockImplementation(mockReadFileImpl);
    mockRealPath.mock.mockImplementation(mockRealPathImpl);
    mockStat.mock.mockImplementation(mockStatImpl);

    mockFile = mockFileImpl;
  });

  function createMockTestPack({ tests } = {}) {
    return { tests, id: 'mock' };
  }

  function createMockManifest({ changelog, specRequirement } = {}) {
    return {
      payload: 'payload.js',
      changelog: changelog ?? [],
      tags: {
        'spec-requirement': specRequirement ?? 'MUST'
      }
    };
  }

  await it('adds all new tests', async () => {
    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({ path: '/act/api/testpacks/mock' })
      .reply(
        200,
        createMockTestPack({
          tests: ['/act/test/monorepo/latest/two-plus-two-eq-four/']
        })
      );

    mockFile('src/two-plus-two-eq-four/payload.js', '');
    mockFile('src/nine-plus-ten-eq-twenty-one/payload.js', '');
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'bundle/nine-plus-ten-eq-twenty-one/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await compileTestPack(['./'], { pack: 'mock', version: 'latest' });

    assert.equal(error, null);
    assert.deepEqual(
      value,
      createMockTestPack({
        tests: [
          '/act/test/monorepo/latest/two-plus-two-eq-four/',
          '/act/test/monorepo/latest/nine-plus-ten-eq-twenty-one/'
        ]
      })
    );
  });

  await it('removes all deleted tests', async () => {
    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({ path: '/act/api/testpacks/mock' })
      .reply(
        200,
        createMockTestPack({
          tests: [
            '/act/test/monorepo/latest/two-plus-two-eq-four/',
            '/act/test/monorepo/latest/nine-plus-ten-eq-twenty-one/'
          ]
        })
      );

    mockFile('src/nine-plus-ten-eq-twenty-one/payload.js', '');
    mockFile(
      'bundle/nine-plus-ten-eq-twenty-one/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await compileTestPack(['./'], { pack: 'mock', version: 'latest' });

    assert.equal(error, null);
    assert.deepEqual(
      value,
      createMockTestPack({
        tests: ['/act/test/monorepo/latest/nine-plus-ten-eq-twenty-one/']
      })
    );
  });

  await it('fails if a test has undocumented changes since the last version', async () => {
    const mockPool = agent.get('https://certification.bbctvapps.co.uk');

    mockPool.intercept({ path: '/act/api/testpacks/mock' }).reply(
      200,
      createMockTestPack({
        tests: ['/act/test/monorepo/v1.0.0-0/nine-plus-ten-eq-twenty-one/']
      })
    );

    mockPool
      .intercept({
        path: '/act/test/monorepo/v1.0.0-0/nine-plus-ten-eq-twenty-one/payload.js'
      })
      .reply(200, 'assert(9 + 10, 21)');

    mockFile('src/nine-plus-ten-eq-twenty-one/payload.js', 'assert(9 + 10, 19)');
    mockFile('bundle/nine-plus-ten-eq-twenty-one/payload.js', 'assert(9 + 10, 19)');
    mockFile(
      'bundle/nine-plus-ten-eq-twenty-one/manifest.json',
      JSON.stringify(
        createMockManifest({ changelog: [{ version: 'latest', 'change-type': 'New Test' }] })
      )
    );

    const [error, value] = await compileTestPack(['./'], { pack: 'mock', version: 'v1.0.0-16' });

    assert.equal(value, null);
    assert.equal(error instanceof AggregateError, true);
    assert.equal(error.errors.length, 1);
    assert.deepEqual(error.errors[0].cause, {
      key: 'getVersion.undocumentedChange',
      values: { testPath: 'nine-plus-ten-eq-twenty-one', currentVersion: 'v1.0.0-0' }
    });
  });

  await it('updates the version of any tests that changed', async () => {
    const mockPool = agent.get('https://certification.bbctvapps.co.uk');

    mockPool.intercept({ path: '/act/api/testpacks/mock' }).reply(
      200,
      createMockTestPack({
        tests: [
          '/act/test/monorepo/v1.0.0-0/two-plus-two-eq-four/',
          '/act/test/monorepo/v1.0.0-0/nine-plus-ten-eq-twenty-one/'
        ]
      })
    );

    mockPool
      .intercept({
        path: '/act/test/monorepo/v1.0.0-0/two-plus-two-eq-four/payload.js'
      })
      .reply(200, 'assert(2 + 2, 4)');

    mockPool
      .intercept({
        path: '/act/test/monorepo/v1.0.0-0/nine-plus-ten-eq-twenty-one/payload.js'
      })
      .reply(200, 'assert(9 + 10, 21)');

    mockFile('src/two-plus-two-eq-four/payload.js', 'assert(2 + 2, 4)');
    mockFile('bundle/two-plus-two-eq-four/payload.js', 'assert(2 + 2, 4)');
    mockFile('src/nine-plus-ten-eq-twenty-one/payload.js', 'assert(9 + 10, 19)');
    mockFile('bundle/nine-plus-ten-eq-twenty-one/payload.js', 'assert(9 + 10, 19)');
    mockFile(
      'bundle/two-plus-two-eq-four/manifest.json',
      JSON.stringify(
        createMockManifest({
          changelog:
            // unchanged so changelog not required
            [{ version: 'latest', 'change-type': 'New Test' }]
        })
      )
    );
    mockFile(
      'bundle/nine-plus-ten-eq-twenty-one/manifest.json',
      JSON.stringify(
        createMockManifest({
          changelog: [
            { version: 'v1.0.0-0', 'change-type': 'New Test' },
            // changed: update latest and document previous change as v1
            { version: 'latest', 'change-type': 'Improvement' }
          ]
        })
      )
    );

    const [error, value] = await compileTestPack(['./'], { pack: 'mock', version: 'v1.0.0-16' });

    assert.equal(error, null);
    assert.deepEqual(
      value,
      createMockTestPack({
        tests: [
          '/act/test/monorepo/v1.0.0-0/two-plus-two-eq-four/',
          '/act/test/monorepo/v1.0.0-16/nine-plus-ten-eq-twenty-one/'
        ]
      })
    );
  });

  await it('accepts a file url to a local pack as a pack', async () => {
    mockFile(
      '/etc/testpack.json',
      JSON.stringify(
        createMockTestPack({
          tests: ['/act/test/monorepo/latest/two-plus-two-eq-four/']
        })
      )
    );

    mockFile('src/two-plus-two-eq-four/payload.js', '');
    mockFile('src/nine-plus-ten-eq-twenty-one/payload.js', '');
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'bundle/nine-plus-ten-eq-twenty-one/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await compileTestPack(['./'], {
      pack: 'file:///etc/testpack.json',
      version: 'latest'
    });

    assert.equal(error, null);
    assert.deepEqual(
      value,
      createMockTestPack({
        tests: [
          '/act/test/monorepo/latest/two-plus-two-eq-four/',
          '/act/test/monorepo/latest/nine-plus-ten-eq-twenty-one/'
        ]
      })
    );
  });
});
