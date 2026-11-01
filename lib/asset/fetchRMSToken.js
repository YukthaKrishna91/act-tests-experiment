import { FetchError, FetchErrorType } from '../error/FetchError.js';

const RMS_TOKEN_ENDPOINT = 'https://rms.api.bbc.co.uk/v2/sign/token/{service_id}';
const rmsApiKey = 'AL8vPAXVkffJv2bth9kIjCnxnT1ei6Ai';

export async function fetchRMSToken(cvid, kind, streamType) {
  if (!(kind === 'audio' && streamType === 'simulcast')) {
    return undefined;
  }

  const serviceId = parseServiceIdFromCvid(cvid);

  const tokenURL = RMS_TOKEN_ENDPOINT.replace('{service_id}', serviceId);
  let response;

  try {
    response = await fetch(tokenURL, {
      method: 'GET',
      headers: {
        'x-api-key': rmsApiKey
      }
    });
  } catch (error) {
    throw new FetchError(
      `Network failure while fetching RMS token.`,
      FetchErrorType.NETWORK_FAILURE,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new FetchError(
      `Bad response for RMS token. Status: ${response.status} ${response.statusText}.`,
      FetchErrorType.BAD_RESPONSE
    );
  }

  try {
    const { token } = await response.json();

    return token;
  } catch (error) {
    throw new FetchError(`JSON parse failure for RMS token.`, FetchErrorType.JSON_PARSE_FAILURE, {
      cause: error
    });
  }
}

function parseServiceIdFromCvid(cvid) {
  if (cvid.startsWith('urn:bbc:pips:pid')) {
    return cvid.replace('urn:bbc:pips:pid:', '');
  }

  throw new TypeError(`No parser for cvid schema. (got '${cvid}')`);
}
