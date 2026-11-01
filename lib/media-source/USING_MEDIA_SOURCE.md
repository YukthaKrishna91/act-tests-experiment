# Cheatsheet: Using MediaSource Functions

## Set up `MediaSource`

```js
// Set up so all events and actions on this object are logged to the console.
const mediaSource = setupMediaSource(mediaSource, { act: actHandle });
```

## Call `MediaSource` methods

```js
// log endOfStream call to console
endOfStream(mediaElement);

// log setting duration to console
setDuration(mediaElement);

// log setLiveSeekableRange call to console
setLiveSeekableRange(mediaElement);
```
