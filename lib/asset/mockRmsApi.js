export const RMS_API = 'https://rms.api.bbc.co.uk';

export function mockTokenPath(id) {
  const isCvid = id.startsWith('urn:bbc');

  const serviceId = isCvid ? parseServiceIdFromCvid(id) : id;

  return `/v2/sign/token/${serviceId}`;
}

function parseServiceIdFromCvid(cvid) {
  if (cvid.startsWith('urn:bbc:pips:pid')) {
    return cvid.replace('urn:bbc:pips:pid:', '');
  }

  throw new TypeError(`No parser defined for this cvid schema. (got '${cvid}')`);
}

/**
 * Builds an object you can use to mock JWT token responses from Audio Metadata's (fka RMS) auth token API
 *
 * @see {@link https://confluence.dev.bbc.co.uk/spaces/RMServices/pages/342564604/Tokens+JWT+-+Overview|Radio & Music Services: Tokens API}
 *
 * @param  {string} token
 */
export function mockToken(token) {
  if (typeof token !== 'string') {
    throw new TypeError(`No token provided. (got '${token}')`);
  }

  return { token };
}
