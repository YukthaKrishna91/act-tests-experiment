import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { mockFileSystem } from '../common/mockFileSystem.js';

await describe('hasActId', async () => {
  const mockReadFile = mock.fn();
  const mockRealPath = mock.fn();

  let agent;
  let hasActId;
  let mockFile;
  let mockLink;

  before(async () => {
    mock.module('node:fs/promises', {
      namedExports: {
        readFile: mockReadFile,
        realpath: mockRealPath
      }
    });

    ({ hasActId } = await import('./hasActId.js'));
  });

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
    setGlobalDispatcher(agent);

    const {
      mockFile: mockFileImpl,
      mockLink: mockLinkImpl,
      mockReadFile: mockReadFileImpl,
      mockRealPath: mockRealPathImpl
    } = mockFileSystem({ rootDir: CANONICAL_REPO_PATH });

    mockReadFile.mock.mockImplementation(mockReadFileImpl);
    mockRealPath.mock.mockImplementation(mockRealPathImpl);

    mockFile = mockFileImpl;
    mockLink = mockLinkImpl;
  });

  function createMockManifest({ changelog, specRequirement, testId } = {}) {
    return {
      payload: 'payload.js',
      changelog: changelog ?? [],
      tags: {
        'spec-requirement': specRequirement ?? 'MUST',
        'testpack-id': testId == null ? [] : [testId]
      }
    };
  }

  await it('returns an error if the input path is not an ACT manifest', async () => {
    mockFile('src/two-plus-two-eq-four/payload.js', 'assert(2 + 2, 4)');

    const [error, value] = await hasActId('src/two-plus-two-eq-four/payload.js');

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'notActManifest');
  });

  await it('returns an error if the path outside repo src/', async () => {
    mockFile('/rogue/path/to/manifest.json', JSON.stringify(createMockManifest()));

    mockLink('src/path/to/symlinked/manifest.json', '/rogue/path/to/manifest.json');

    const [error, value] = await hasActId('src/path/to/symlinked/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'manifestOutsideSrc');
  });

  await it('returns an error if the path is within _staged/', async () => {
    mockFile(
      'src/_staged/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await hasActId('src/_staged/two-plus-two-eq-four/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'manifestWithinStaged');
  });

  await it('returns an error if the local and remote ACT ID are different', async () => {
    mockFile(
      'src/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    mockFile(
      'bundle/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        path: '/act/api/test-id',
        query: { testUrl: '/act/test/monorepo/latest/two-plus-two-eq-four/' }
      })
      .reply(200, { testId: 'ACT-4321' });

    const [error, value] = await hasActId('src/two-plus-two-eq-four/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'testIdsNotEq');
  });

  await it('is true if the manifest has an ACT ID and it matches the remote ACT ID', async () => {
    mockFile(
      'src/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    mockFile(
      'bundle/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        path: '/act/api/test-id',
        query: { testUrl: '/act/test/monorepo/latest/two-plus-two-eq-four/' }
      })
      .reply(200, { testId: 'ACT-1234' });

    const [error, value] = await hasActId('src/two-plus-two-eq-four/manifest.json');

    assert.equal(error, null);
    assert.equal(value, true);
  });

  await it('is false if the manifest does not have a remote ACT ID', async () => {
    mockFile(
      'src/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    mockFile(
      'bundle/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        path: '/act/api/test-id',
        query: { testUrl: '/act/test/monorepo/latest/two-plus-two-eq-four/' }
      })
      .reply(404);

    const [error, value] = await hasActId('src/two-plus-two-eq-four/manifest.json');

    assert.equal(error, null);
    assert.equal(value, false);
  });
});
