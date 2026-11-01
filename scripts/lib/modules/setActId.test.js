import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { mockFileSystem } from '../common/mockFileSystem.js';

await describe('setActId', async () => {
  const mockReadFile = mock.fn();
  const mockRealPath = mock.fn();

  let agent;
  let setActId;
  let mockFile;
  let mockLink;

  before(async () => {
    mock.module('node:fs/promises', {
      namedExports: {
        readFile: mockReadFile,
        realpath: mockRealPath
      }
    });

    ({ setActId } = await import('./setActId.js'));
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

  function createMockUserInterface() {
    return {
      pause: mock.fn(),
      question: mock.fn(undefined, () => {
        throw new Error('No answer provided');
      })
    };
  }

  await it('returns an error if the input path is not an ACT manifest', async () => {
    mockFile('src/two-plus-two-eq-four/payload.js', 'assert(2 + 2, 4)');

    const [error, value] = await setActId(
      createMockUserInterface(),
      'src/two-plus-two-eq-four/payload.js'
    );

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'notActManifest');
  });

  await it('returns an error if the path is outside repo src/', async () => {
    mockFile('/rogue/path/to/manifest.json', JSON.stringify(createMockManifest()));

    mockLink('src/path/to/symlinked/manifest.json', '/rogue/path/to/manifest.json');

    const [error, value] = await setActId(
      createMockUserInterface(),
      'src/path/to/symlinked/manifest.json'
    );

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'manifestOutsideSrc');
  });

  await it('returns an error if the path is within _staged/', async () => {
    mockFile(
      'src/_staged/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await setActId(
      createMockUserInterface(),
      'src/_staged/two-plus-two-eq-four/manifest.json'
    );

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'manifestWithinStaged');
  });

  await it('returns an error if the manifest has an ID', async () => {
    mockFile(
      'src/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    mockFile(
      'bundle/two-plus-two-eq-four/manifest.json',
      JSON.stringify(createMockManifest({ testId: 'ACT-1234' }))
    );

    const [error, value] = await setActId(
      createMockUserInterface(),
      'src/two-plus-two-eq-four/manifest.json'
    );

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'manifestHasTestId');
  });

  await it('returns an error if the user aborted', async () => {
    mockFile('src/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));

    const mockUI = createMockUserInterface();

    mockUI.question.mock.mockImplementationOnce(() => Promise.resolve('no'));

    const [error, value] = await setActId(mockUI, 'src/two-plus-two-eq-four/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof DOMException, true);
    assert.equal(error.name, 'AbortError');
  });

  await it('returns an error if the script failed to update the ACT testId database', async () => {
    mockFile('src/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        method: 'POST',
        path: '/act/api/test-id'
      })
      .reply(500);

    const mockUI = createMockUserInterface();

    mockUI.question.mock.mockImplementationOnce(() => Promise.resolve('yes'));

    const [error, value] = await setActId(mockUI, 'src/two-plus-two-eq-four/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof Error, true);
    assert.equal(error.cause?.key, 'postStatusNotOk');
  });

  await it("returns an error if the response from the ACT API doesn't contain a valid testId", async () => {
    mockFile('src/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        method: 'POST',
        path: '/act/api/test-id'
      })
      .reply(200, { testId: 'BAD-1234' });

    const mockUI = createMockUserInterface();

    mockUI.question.mock.mockImplementationOnce(() => Promise.resolve('yes'));

    const [error, value] = await setActId(mockUI, 'src/two-plus-two-eq-four/manifest.json');

    assert.equal(value, null);
    assert.equal(error instanceof TypeError, true);
    assert.equal(error.cause?.key, 'postResponseNotOk');
  });

  await it('returns the new test id', async () => {
    mockFile('src/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile('bundle/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));

    agent
      .get('https://certification.bbctvapps.co.uk')
      .intercept({
        method: 'POST',
        path: '/act/api/test-id',
        body: /{\s*"testUrl":\s?".+"\s*}/
      })
      .reply(200, { testId: 'ACT-1234' });

    const mockUI = createMockUserInterface();

    mockUI.question.mock.mockImplementationOnce(() => Promise.resolve('yes'));

    const [error, value] = await setActId(mockUI, 'src/two-plus-two-eq-four/manifest.json');

    assert.equal(error, null);
    assert.equal(value, 'ACT-1234');
  });
});
