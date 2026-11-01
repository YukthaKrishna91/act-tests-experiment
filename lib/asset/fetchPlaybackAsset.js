import { FetchError, FetchErrorType } from '../error/FetchError.js';

/**
 * Fetches the playback asset with the given ID.
 */
export default async function fetchPlaybackAsset(id) {
  let response;
  const assetUrl = 'https://interactive-tv.files.bbci.co.uk/playback-assets/assets.json';

  try {
    response = await fetch(assetUrl);
  } catch (error) {
    throw new FetchError(
      `Network failure while fetching playback asset ${id}.`,
      FetchErrorType.NETWORK_FAILURE,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new FetchError(
      `Bad response for asset ${id}. Status: ${response.status} ${response.statusText}.`,
      FetchErrorType.BAD_RESPONSE
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new FetchError(
      `JSON parse failure for playback asset ${id}.`,
      FetchErrorType.JSON_PARSE_FAILURE,
      { cause: error }
    );
  }

  if (data[id] == null) {
    throw new Error(`Playback asset ${id} not found.`);
  }

  return data[id];
}
