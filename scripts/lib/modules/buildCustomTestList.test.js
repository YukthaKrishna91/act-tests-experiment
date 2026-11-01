import assert from 'node:assert/strict';
import { before, beforeEach, describe, it, mock } from 'node:test';
import { CANONICAL_REPO_PATH } from '../common/Repo.js';
import { mockFileSystem } from '../common/mockFileSystem.js';

await describe('buildCustomTestList', async () => {
  const mockRealPath = mock.fn();

  let buildCustomTestList;
  let mockFile;
  let mockLink;

  before(async () => {
    mock.module('node:fs/promises', {
      namedExports: {
        realpath: mockRealPath
      }
    });

    ({ buildCustomTestList } = await import('./buildCustomTestList.js'));
  });

  beforeEach(() => {
    const {
      mockFile: mockFileImpl,
      mockLink: mockLinkImpl,
      mockRealPath: mockRealPathImpl
    } = mockFileSystem({
      rootDir: CANONICAL_REPO_PATH
    });

    mockRealPath.mock.mockImplementation(mockRealPathImpl);

    mockFile = mockFileImpl;
    mockLink = mockLinkImpl;
  });

  function createMockManifest({ changelog, specRequirement } = {}) {
    return {
      payload: 'payload.js',
      changelog: changelog ?? [],
      tags: {
        'spec-requirement': specRequirement ?? 'MUST'
      }
    };
  }

  await it('returns a URL to a custom test list that contains all input tests', async () => {
    mockFile('src/maths/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json',
      JSON.stringify(createMockManifest())
    );
    mockFile('src/alphabet/a-comes-before-b/manifest.json', JSON.stringify(createMockManifest()));

    const [error, value] = await buildCustomTestList([
      'src/maths/two-plus-two-eq-four/manifest.json',
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json'
    ]);

    const expectedTestUrls = [
      '/act/test/monorepo/latest/maths/two-plus-two-eq-four/',
      '/act/test/monorepo/latest/maths/nine-plus-ten-eq-twentyone/'
    ];

    const expectedUrl = new URL('https://certification.bbctvapps.co.uk/act/portal/');

    expectedUrl.searchParams.append('testList', 'custom');
    expectedUrl.searchParams.append('customTestList', JSON.stringify(expectedTestUrls));

    assert.equal(error, null);
    assert.equal(value.href, expectedUrl.href);
  });

  await it('constructs paths to manifests from changed payloads', async () => {
    mockFile('src/maths/two-plus-two-eq-four/payload.js', '');
    mockFile('src/maths/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json',
      JSON.stringify(createMockManifest())
    );

    const [error, value] = await buildCustomTestList([
      'src/maths/two-plus-two-eq-four/payload.js',
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json'
    ]);

    const expectedTestUrls = [
      '/act/test/monorepo/latest/maths/two-plus-two-eq-four/',
      '/act/test/monorepo/latest/maths/nine-plus-ten-eq-twentyone/'
    ];

    const expectedUrl = new URL('https://certification.bbctvapps.co.uk/act/portal/');

    expectedUrl.searchParams.append('testList', 'custom');
    expectedUrl.searchParams.append('customTestList', JSON.stringify(expectedTestUrls));

    assert.equal(error, null);
    assert.equal(value.href, expectedUrl.href);
  });

  await it('returns a URL to a custom test list for a version', async () => {
    mockFile('src/maths/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json',
      JSON.stringify(createMockManifest())
    );
    mockFile('src/alphabet/a-comes-before-b/manifest.json', JSON.stringify(createMockManifest()));

    const [error, value] = await buildCustomTestList(
      [
        'src/maths/two-plus-two-eq-four/manifest.json',
        'src/maths/nine-plus-ten-eq-twentyone/manifest.json'
      ],
      { version: 'v27.0.0-1' }
    );

    const expectedTestUrls = [
      '/act/test/monorepo/v27.0.0-1/maths/two-plus-two-eq-four/',
      '/act/test/monorepo/v27.0.0-1/maths/nine-plus-ten-eq-twentyone/'
    ];

    const expectedUrl = new URL('https://certification.bbctvapps.co.uk/act/portal/');

    expectedUrl.searchParams.append('testList', 'custom');
    expectedUrl.searchParams.append('customTestList', JSON.stringify(expectedTestUrls));

    assert.equal(error, null);
    assert.equal(value.href, expectedUrl.href);
  });

  await it('returns a URL to a custom test list on a different environment', async () => {
    mockFile('src/maths/two-plus-two-eq-four/manifest.json', JSON.stringify(createMockManifest()));
    mockFile(
      'src/maths/nine-plus-ten-eq-twentyone/manifest.json',
      JSON.stringify(createMockManifest())
    );
    mockFile('src/alphabet/a-comes-before-b/manifest.json', JSON.stringify(createMockManifest()));

    const [error, value] = await buildCustomTestList(
      [
        'src/maths/two-plus-two-eq-four/manifest.json',
        'src/maths/nine-plus-ten-eq-twentyone/manifest.json'
      ],
      { certDomain: 'test' }
    );

    const expectedTestUrls = [
      '/act/test/monorepo/latest/maths/two-plus-two-eq-four/',
      '/act/test/monorepo/latest/maths/nine-plus-ten-eq-twentyone/'
    ];

    const expectedUrl = new URL('https://certification.test.bbctvapps.co.uk/act/portal/');

    expectedUrl.searchParams.append('testList', 'custom');
    expectedUrl.searchParams.append('customTestList', JSON.stringify(expectedTestUrls));

    assert.equal(error, null);
    assert.equal(value.href, expectedUrl.href);
  });

  await it('returns an error if no files are ACT tests', async () => {
    mockFile('/rogue/path/to/manifest.json', JSON.stringify(createMockManifest()));
    mockLink('src/path/to/symlinked/manifest.json', '/rogue/path/to/manifest.json');
    mockFile('package.json');
    mockFile('eslint.config.json');

    const [error, value] = await buildCustomTestList([
      'package.json',
      'eslint.config.json',
      'src/path/to/symlinked/manifest.json'
    ]);

    assert.equal(value, null);
    assert.equal(error.name, 'TypeError');
    assert.equal(error.message, 'No monorepo ACT tests provided. (got 3 paths)');
  });
});
