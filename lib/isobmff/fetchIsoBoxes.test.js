import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { readFixture } from '../__test_fixtures/readFixture.js';
import { consumeAsyncIterable } from '../async-iterable/consumeAsyncIterable.js';
import { fetchIsoBoxes } from './fetchIsoBoxes.js';
import { buildFileType } from './buildIsoBox.js';

describe('fetchIsoBoxes', () => {
  let agent;

  beforeEach(() => {
    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  it('parses a box', async () => {
    agent
      .get('https://mock.cdn')
      .intercept({ path: '/001.m4s' })
      .reply(
        200,
        buildFileType({ majorBrand: 'isom', minorVersion: 1, compatibleBrands: ['isom'] })
      );

    const boxes = await consumeAsyncIterable(fetchIsoBoxes('https://mock.cdn/001.m4s'));

    assert.equal(boxes.length, 1);
    assert.equal(boxes[0].type, 'ftyp');
  });

  it('parses a (small) file', async () => {
    agent
      .get('https://mock.cdn')
      .intercept({ path: '/001.m4s' })
      .reply(200, readFixture('captions.mp4'));

    const boxes = await consumeAsyncIterable(fetchIsoBoxes('https://mock.cdn/001.m4s'));

    assert.equal(boxes.length, 4);
    assert.equal(boxes[0].type, 'ftyp');
    assert.equal(boxes[1].type, 'moov');
    assert.equal(boxes[2].type, 'mdat');
    assert.equal(boxes[3].type, 'free');
  });
});
