# Cheatsheet: Using the `test` API

## `test` API

```ts
function test(name: string, testFunction: (actHandle: ActHandle) => Promise<void>): Promise<void>;
```

### `ActHandle`

```typescript
type ActHandle = {
  /**
   * Log to ACT and the browser console
   */
  log(parts: ...any[]): void

  /**
   * Record the outcome of an assertion. Any failed assertions will fail the test. Doesn't stop execution.
   */
  assert(assertion: boolean, message: string): void

  /**
   * Record a test failure. This will fail the test. Doesn't stop execution.
   */
  fail(reason: string): void

  /**
   * Start building a prompt for the user.
   * @see {@link https://certification.bbctvapps.co.uk/act/devhub/sdk/03-Usage-of-ACT-SDK.html#act-ask-message-addbutton-label-value-class-send-callback}
   */
  ask(message: string): ActPromptBuilder

  /**
   * Render an element to the ACT UI.
   * @see {@link https://certification.bbctvapps.co.uk/act/devhub/sdk/03-Usage-of-ACT-SDK.html#act-render-element-callback}
   */
  render(element: HTMLElement): Promise<void>

  /**
   * Fetch the device config for the current device.
   * @see {@link https://certification.bbctvapps.co.uk/act/devhub/guide/05-using-the-test-api.html#using-device-config-in-an-act-test}
   */
  fetchDeviceConfig(environment: "default" | "precert"): Promise<DeviceConfig>
}
```

## Usage

### Create a test

```js
test('playing video', async (actHandle) => {
  const videoElement = document.createElement('video');

  // test continues...
});
```

### Render

```js
await actHandle.render(videoElement);
```

### Assert

```js
actHandle.assert(
  videoElement.ended,
  `VideoElement.ended should be true. (got ${videoElement.ended})`
);
```
