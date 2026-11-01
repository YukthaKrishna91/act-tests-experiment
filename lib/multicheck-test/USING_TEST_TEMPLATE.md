# Cheatsheet: Using the `template` API

## `template` API

```typescript
function template(name: string, options: TemplateOptions, testFunction: (actHandle: ActHandle, values: ValuesFromSchema));

type TemplateOptions = {
  /**
   * Defines the expected keys in the `values` object passed to the test function.
   */
  values: Schema[];
};

type Schema = {
  key: PropertyKey;
  required?: boolean;
  values?: Schema[];
};
```

## Usage

### Create a template

```js
const createTest = createTemplate(
  'play a stream',
  {
    values: [
      { key: 'url', required: true },
      {
        key: 'meta',
        values: [{ key: 'encoding' }]
      }
    ]
  },
  async (actHandle, { url, meta }) => {
    const videoElement = document.createElement('video');

    videoElement.src = url;

    act.log(`Loading an ${meta?.encoding ?? 'mp4'} video.`);
  }
);
```

### Use a template

```js
const { name, func } = createTest('webm', { url: 'example.webm', meta: { encoding: 'webm' } });

test(name, async (actHandle) => func(actHandle));
```
