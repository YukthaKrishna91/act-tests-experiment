export const TV_FILES = 'https://interactive-tv.files.bbci.co.uk';
export const PLAYBACK_ASSETS = '/playback-assets/assets.json';

/**
 * Builds an object you can use to mock the playback-assets file
 *
 * @see {@link https://github.com/bbc/playback-assets|github.com/bbc/playback-assets}
 *
 * @param  {...[id: string, asset: object]} assets
 */
export function mockPlaybackAssets(...assets) {
  if (assets.length === 0) {
    throw new TypeError(`No assets provided.`);
  }

  return Object.fromEntries(assets);
}

export function mockUnmediated(
  urls,
  {
    title,
    description,
    tags = [],
    kind = 'video',
    quality = 'hd',
    encoding = 'h264',
    streamType = 'ondemand',
    ...extra
  } = {}
) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new TypeError(`No urls provided. (got '${urls}')`);
  }

  const resolvedUrls = urls.map((url) =>
    typeof url === 'string' ? { url, cdn: new URL(url).hostname } : url
  );

  return {
    tags,
    title: title ?? `Unmediated ${encoding} ${streamType} ${kind} in ${quality}`,
    description: description ?? `A ${encoding} ${streamType} ${kind} stream in ${quality} quality`,
    media: { kind, streamType, quality, encoding, ...extra, urls: resolvedUrls }
  };
}

export function mockMediated(
  cvid,
  {
    title,
    description,
    mediatorUrl,
    tags = [],
    kind = 'video',
    quality = 'hd',
    encoding = 'h264',
    streamType = 'ondemand',
    ...extra
  } = {}
) {
  if (typeof cvid !== 'string') {
    throw new TypeError(`No cvid provided. (got '${cvid}')`);
  }

  return {
    tags,
    title: title ?? `Mediated ${encoding} ${streamType} ${kind} in ${quality}`,
    description: description ?? `A ${encoding} ${streamType} ${kind} stream in ${quality} quality`,
    media: { kind, streamType, quality, encoding, ...extra, cvid },
    ...{ mediatorUrl }
  };
}
