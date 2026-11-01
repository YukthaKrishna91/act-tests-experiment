export const SECUREGATE = 'https://securegate.iplayer.bbc.co.uk';

export function mockMediationPath(cvid, { mediaSet = 'iptv-mse' } = {}) {
  if (typeof cvid !== 'string') {
    throw new TypeError(`No cvid provided. (got '${cvid}')`);
  }

  return `/mediaselector/6/select/version/3.0/mediaset/${mediaSet}/cvid/${cvid}/format/json/cors/1/proto/https`;
}

/**
 * Builds an object you can use to mock mediation responses from MediaSelector's Select@v3 API
 *
 * @see {@link https://confluence.dev.bbc.co.uk/spaces/MediaSelector/pages/276266692/Media+Selector+Select+API+-+v3.0|Media Selector: Select@v3 API}
 *
 * @param  {...object} media
 */
export function mockMediation(...media) {
  if (media.length === 0) {
    throw new TypeError('No media provided.');
  }

  return { media };
}

function mockConnection(url, { dpw = 1, transferFormat = 'dash' } = {}) {
  const { href, hostname: supplier, protocol: proto } = new URL(url);

  const protocol = proto.slice(0, -1);

  const params = { href, protocol, supplier };

  return {
    href,
    protocol,
    supplier,
    dpw: `${typeof dpw === 'function' ? dpw(params) : dpw}`,
    transferFormat: typeof transferFormat === 'function' ? transferFormat(params) : transferFormat
  };
}

export function mockAudio(urls, { dpw, encoding = 'aac', transferFormat = 'dash' } = {}) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new TypeError('No urls provided.');
  }

  return {
    encoding,
    kind: 'audio',
    connection: urls.map((url) =>
      mockConnection(url, {
        dpw,
        transferFormat
      })
    )
  };
}

export function mockVideo(urls, { dpw, encoding = 'h264', transferFormat = 'dash' } = {}) {
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new TypeError('No urls provided.');
  }

  return {
    encoding,
    kind: 'video',
    connection: urls.map((url) =>
      mockConnection(url, {
        dpw,
        transferFormat
      })
    )
  };
}
