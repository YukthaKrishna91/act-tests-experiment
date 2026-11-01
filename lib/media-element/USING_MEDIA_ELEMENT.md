# Cheatsheet: Using MediaElement Functions

## Set up `HTMLMediaElement`

```js
// Set up so all events and actions on this object are logged to the console.
const mediaElement = setupMediaElement(document.createElement('video'), mediaSource, {
  act: actHandle
});
```

## Call `HTMLMediaElement` methods

```js
// log pause call to console
pause(mediaElement);

// log play call to console
play(mediaElement);

// log setting currentTime to console
setCurrentTime(mediaElement);
```

## Measure `HTMLMediaElement`

```js
// measure the delta of `currentTime` during the time (in seconds) provided.
const timeProgressed measurePlaybackProgressionOverTime(mediaElement, 5)
```
