# Cheatsheet: Using SourceBuffer Functions

## Set up `SourceBuffer`

```js
// Set up so all events and actions on this object are logged to the console
const sourceBuffer = createSourceBuffer(mediaSource, 'video/mp4', { act: actHandle });
```

## Call `SourceBuffer` methods

```js
// wait for append to complete
await appendBuffer(sourceBuffer, await source.fetchInitSegment());

// wait for remove to complete
await removeBuffer(sourceBuffer, [2, 8]);

// wait for buffer to be ready for interaction
await waitUntilReady(sourceBuffer);

// log setting timestampOffset to console
setTimestampOffset(sourceBuffer, -500);
```
