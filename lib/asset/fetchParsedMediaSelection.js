import { parseMediaSelection } from './parseMediaSelection.js';
import { FetchError, FetchErrorType } from '../error/FetchError.js';

const MEDIA_SELECTOR_URL_TEMPLATE =
  'mediaselector/6/select/version/3.0/mediaset/%mediaset%/cvid/%cvid%/format/json/cors/1/proto/https';

const QUALITY_MAP = {
  uhd: 'iptv-uhd',
  bvq: 'iptv-bvq',
  hd: 'iptv-mse'
};

export async function fetchParsedMediaSelection(
  mediatorUrl,
  { cvid, kind, playbackQuality, encoding, jwt }
) {
  const mediaSet = QUALITY_MAP[playbackQuality] || 'iptv-mse';

  const mediaSelectorURL = formatRequestUrl(mediatorUrl, MEDIA_SELECTOR_URL_TEMPLATE, {
    cvid,
    mediaSet,
    jwt
  });

  const mediaSelector = await fetchMediaSelector(mediaSelectorURL);

  const parsedMediaSelector = parseMediaSelection(mediaSelector, { kind, mediaSet, encoding });

  return parsedMediaSelector;
}

async function fetchMediaSelector(mediaSelectorURL) {
  let response;

  try {
    response = await fetch(mediaSelectorURL, { credentials: 'include' });
  } catch (error) {
    throw new FetchError(
      `Network failure while fetching media selector URL: ${mediaSelectorURL}.`,
      FetchErrorType.NETWORK_FAILURE,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new FetchError(
      `Bad response for media selector URL: ${mediaSelectorURL}. Status: ${response.status} ${response.statusText}.`,
      FetchErrorType.BAD_RESPONSE
    );
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    throw new FetchError(
      `JSON parse failure for media selector URL: ${mediaSelectorURL}.`,
      FetchErrorType.JSON_PARSE_FAILURE,
      { cause: error }
    );
  }
}

function formatRequestUrl(mediatorUrl, urlTemplate, { cvid, mediaSet, jwt = undefined }) {
  urlTemplate = urlTemplate.replace('%cvid%', cvid).replace('%mediaset%', mediaSet);

  if (jwt) {
    urlTemplate = `${urlTemplate}?jwt_auth=${jwt}`;
  }

  return mediatorUrl + urlTemplate;
}
