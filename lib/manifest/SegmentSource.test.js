import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { getError } from '../error/getError.js';
import { expectEvent } from '../event-target/expectEvent.js';
import { PromiseController } from '../promise/PromiseController.js';
import { SegmentSource } from './SegmentSource.js';

describe('SegmentSource', () => {
  let agent;

  beforeEach(() => {
    agent = new MockAgent();
    setGlobalDispatcher(agent);
    agent.disableNetConnect();
  });

  function createMockDescriptor() {
    return {
      getInitSegment: mock.fn(),
      getMediaSegmentForTime: mock.fn(),
      getMediaSegmentsForTimeRange: mock.fn(),
      getTimeRangeContaining: mock.fn(),
      getTimeRangesSpanning: mock.fn()
    };
  }

  async function consumeAsyncIterable(iterable) {
    const results = [];

    for await (const result of iterable) {
      results.push(result);
    }

    return results;
  }

  describe('fetchInitSegment', () => {
    it('fetches the init segment as an array buffer', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getInitSegment.mock.mockImplementationOnce(() => 'https://mock.cdn/init.mp4');

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/init.mp4' })
        .reply(200, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      const source = new SegmentSource(descriptor);

      assert.deepEqual(
        await source.fetchInitSegment(),
        new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      );
    });
  });

  describe('fetchBufferForTime', () => {
    it('fetches the media segment as an array buffer', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/001.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [0, 3.84]);

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/001.m4s' })
        .reply(200, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      const source = new SegmentSource(descriptor);

      assert.deepEqual(
        await source.fetchBufferForTime(0),
        new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      );
    });

    it('returns time range for the segment through .fetching property while fetch is in-flight', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/004.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      assert.equal(source.fetching.length, 0);

      const response = source.fetchBufferForTime(15);

      assert.equal(source.fetching.length, 1);
      assert.equal(source.fetching.start(0), 11.52);
      assert.equal(source.fetching.end(0), 15.36);

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await response, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer);

      assert.equal(source.fetching.length, 0);
    });

    it('reuses in-flight fetch to same segment', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementation(() => 'https://mock.cdn/004.m4s');

      descriptor.getTimeRangeContaining.mock.mockImplementation(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      const firstResponse = source.fetchBufferForTime(15);

      const error = await getError(() => source.fetchBufferForTime(15));

      assert.equal(error.message, 'Fetch already in-flight for time range [11.52-15.36].');

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(
        await firstResponse,
        new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      );
    });

    it('emits fetch progress events', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/004.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      const hasFetchStarted = expectEvent(source, 'fetchstarted');

      const response = source.fetchBufferForTime(15);

      assert.equal(await hasFetchStarted(), true);

      const hasFetched = expectEvent(source, 'fetched');
      const hasFetchEnded = expectEvent(source, 'fetchended');

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await response, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer);

      assert.equal(await hasFetched(), true);
      assert.equal(await hasFetchEnded(), true);
    });
  });

  describe('fetchBuffersForTime', () => {
    it('fetches the media segment as an array buffer', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/001.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [0, 3.84]);

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/001.m4s' })
        .reply(200, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      const source = new SegmentSource(descriptor);

      assert.deepEqual(await consumeAsyncIterable(source.fetchBuffersForTime(0)), [
        new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      ]);
    });

    it('returns the range for requested segments through .queued and .fetching property while fetch is in-flight', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/004.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      assert.equal(source.queued.length, 0);
      assert.equal(source.fetching.length, 0);

      const buffers = source.fetchBuffersForTime(15);

      assert.equal(source.queued.length, 1);
      assert.equal(source.queued.start(0), 11.52);
      assert.equal(source.queued.end(0), 15.36);

      assert.equal(source.fetching.length, 0);

      const result = buffers.next();

      assert.equal(source.queued.length, 0);

      assert.equal(source.fetching.length, 1);
      assert.equal(source.fetching.start(0), 11.52);
      assert.equal(source.fetching.end(0), 15.36);

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await result, {
        done: false,
        value: new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      });

      assert.equal(source.fetching.length, 0);

      assert.deepEqual(await buffers.next(), { done: true, value: undefined });
    });
  });

  describe('fetchBuffersForTimeRange', () => {
    it('fetches all media segments as array buffers', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentsForTimeRange.mock.mockImplementationOnce(() => [
        'https://mock.cdn/001.m4s',
        'https://mock.cdn/002.m4s',
        'https://mock.cdn/003.m4s'
      ]);

      descriptor.getTimeRangesSpanning.mock.mockImplementationOnce(() => [
        [0, 3.84],
        [3.84, 7.68],
        [7.68, 11.52]
      ]);

      const mockPool = agent.get('https://mock.cdn');

      mockPool
        .intercept({ path: '/001.m4s' })
        .reply(200, new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));
      mockPool
        .intercept({ path: '/002.m4s' })
        .reply(200, new Uint8Array([0x72, 0x65, 0x62, 0x75, 0x66, 0x66]));
      mockPool
        .intercept({ path: '/003.m4s' })
        .reply(200, new Uint8Array([0x72, 0x75, 0x66, 0x66, 0x65, 0x72]));

      const source = new SegmentSource(descriptor);

      assert.deepEqual(await consumeAsyncIterable(source.fetchBuffersForTimeRange([2, 10])), [
        new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer,
        new Uint8Array([0x72, 0x65, 0x62, 0x75, 0x66, 0x66]).buffer,
        new Uint8Array([0x72, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      ]);
    });

    it('returns time range for requested segments through .queued and .fetching property while fetch is in-flight', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentsForTimeRange.mock.mockImplementationOnce(() => [
        'https://mock.cdn/005.m4s',
        'https://mock.cdn/006.m4s'
      ]);

      descriptor.getTimeRangesSpanning.mock.mockImplementationOnce(() => [
        [15.36, 19.2],
        [19.2, 23.04]
      ]);

      const mockPool = agent.get('https://mock.cdn');

      const firstResponseController = new PromiseController();
      const secondResponseController = new PromiseController();

      mockPool
        .intercept({ path: '/005.m4s' })
        .reply(200, async () => firstResponseController.promise);
      mockPool
        .intercept({ path: '/006.m4s' })
        .reply(200, async () => secondResponseController.promise);

      const source = new SegmentSource(descriptor);

      const buffers = source.fetchBuffersForTimeRange([17, 21]);

      assert.equal(source.queued.length, 1);
      assert.equal(source.queued.start(0), 15.36);
      assert.equal(source.queued.end(0), 23.04);

      assert.equal(source.fetching.length, 0);

      const firstResult = buffers.next();

      assert.equal(source.queued.start(0), 19.2);
      assert.equal(source.queued.end(0), 23.04);

      assert.equal(source.fetching.length, 1);
      assert.equal(source.fetching.start(0), 15.36);
      assert.equal(source.fetching.end(0), 19.2);

      firstResponseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await firstResult, {
        done: false,
        value: new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      });

      assert.equal(source.fetching.length, 0);

      const secondResult = buffers.next();

      assert.equal(source.queued.length, 0);

      assert.equal(source.fetching.length, 1);
      assert.equal(source.fetching.start(0), 19.2);
      assert.equal(source.fetching.end(0), 23.04);

      secondResponseController.resolve(new Uint8Array([0x72, 0x65, 0x62, 0x75, 0x66, 0x66]));

      assert.deepEqual(await secondResult, {
        done: false,
        value: new Uint8Array([0x72, 0x65, 0x62, 0x75, 0x66, 0x66]).buffer
      });

      assert.deepEqual(await buffers.next(), { done: true, value: undefined });
    });
  });

  describe('getting the .fetching property', () => {
    it('always returns the same object', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/004.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      const fetchingRangesBeforeFetch = source.fetching;

      const buffers = source.fetchBuffersForTime(15);

      const response = buffers.next();

      const fetchingRangesDuringFetch = source.fetching;

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await response, {
        done: false,
        value: new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      });

      const fetchingRangesAfterFetch = source.fetching;

      assert.equal(fetchingRangesBeforeFetch, fetchingRangesDuringFetch);
      assert.equal(fetchingRangesDuringFetch, fetchingRangesAfterFetch);
    });
  });

  describe('getting the .queued property', () => {
    it('always returns the same object', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentForTime.mock.mockImplementationOnce(
        () => 'https://mock.cdn/004.m4s'
      );

      descriptor.getTimeRangeContaining.mock.mockImplementationOnce(() => [11.52, 15.36]);

      const responseController = new PromiseController();

      agent
        .get('https://mock.cdn')
        .intercept({ path: '/004.m4s' })
        .reply(200, async () => responseController.promise);

      const source = new SegmentSource(descriptor);

      const queuedRangesBeforeFetch = source.queued;

      const buffers = source.fetchBuffersForTime(15);

      const response = buffers.next();

      const queuedRangesDuringFetch = source.queued;

      responseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await response, {
        done: false,
        value: new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      });

      const queuedRangesAfterFetch = source.queued;

      assert.equal(queuedRangesBeforeFetch, queuedRangesDuringFetch);
      assert.equal(queuedRangesDuringFetch, queuedRangesAfterFetch);
    });
  });

  describe('clearing queued fetches', () => {
    it('clears all queued fetches without impacting in-flight fetches', async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentsForTimeRange.mock.mockImplementationOnce(() => [
        'https://mock.cdn/005.m4s',
        'https://mock.cdn/006.m4s'
      ]);

      descriptor.getTimeRangesSpanning.mock.mockImplementationOnce(() => [
        [15.36, 19.2],
        [19.2, 23.04]
      ]);

      const mockPool = agent.get('https://mock.cdn');

      const firstResponseController = new PromiseController();
      const secondResponseController = new PromiseController();

      mockPool
        .intercept({ path: '/005.m4s' })
        .reply(200, async () => firstResponseController.promise);
      mockPool
        .intercept({ path: '/006.m4s' })
        .reply(200, async () => secondResponseController.promise);

      const source = new SegmentSource(descriptor);

      const buffers = source.fetchBuffersForTimeRange([17, 21]);

      const firstResult = buffers.next();

      assert.equal(source.queued.length, 1);
      assert.equal(source.fetching.length, 1);

      source.clearQueued();

      assert.equal(source.queued.length, 0);
      assert.equal(source.fetching.length, 1);

      firstResponseController.resolve(new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]));

      assert.deepEqual(await firstResult, {
        done: false,
        value: new Uint8Array([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]).buffer
      });

      assert.equal(source.fetching.length, 0);

      const secondResult = buffers.next();

      assert.equal(source.fetching.length, 0);

      assert.deepEqual(await secondResult, { done: true, value: undefined });
    });

    it("triggers a 'queuechange' event", async () => {
      const descriptor = createMockDescriptor();

      descriptor.getMediaSegmentsForTimeRange.mock.mockImplementationOnce(() => [
        'https://mock.cdn/005.m4s'
      ]);

      descriptor.getTimeRangesSpanning.mock.mockImplementationOnce(() => [[15.36, 19.2]]);

      const mockPool = agent.get('https://mock.cdn');

      const firstResponseController = new PromiseController();

      mockPool
        .intercept({ path: '/005.m4s' })
        .reply(200, async () => firstResponseController.promise);

      const source = new SegmentSource(descriptor);

      const isFetchQueued = expectEvent(source, 'queuechange');

      const buffers = source.fetchBuffersForTime(17);

      assert.equal(await isFetchQueued(), true);

      const isFetchAborted = expectEvent(source, 'queuechange');

      source.clearQueued();

      assert.equal(await isFetchAborted(), true);

      assert.deepEqual(await buffers.next(), { done: true, value: undefined });
    });
  });
});
