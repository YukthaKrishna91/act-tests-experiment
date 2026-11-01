import { FetchError, FetchErrorType } from '../error/FetchError.js';
import { fetchMediaAsset } from './fetchMediaAsset.js';

/**
 * Fetch the manifest document for a playback asset as text.
 *
 * @see {@link https://github.com/bbc/playback-assets}
 *
 * @param {string} asset
 */
export const fetchManifest = async (asset) => {
  const manifestURL = await fetchManifestUrl(asset);
  const response = await fetchManifestByURL(manifestURL);
  return { text: await response.text(), baseURL: getManifestBaseURL(response.url) };
};

async function fetchManifestUrl(asset) {
  const media = await fetchMediaAsset(asset);
  const manifestURL = media?.urls?.[0]?.url;

  if (!manifestURL) {
    throw new Error(`No manifest URL found in the media asset.`);
  }

  return manifestURL;
}

async function fetchManifestByURL(url) {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new FetchError(
      `Network failure while fetching manifest from URL: ${url}.`,
      FetchErrorType.NETWORK_FAILURE,
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new FetchError(
      `Bad response for manifest URL: ${url}. Status: ${response.status} ${response.statusText}.`,
      FetchErrorType.BAD_RESPONSE
    );
  }

  return response;
}

function getManifestBaseURL(manifestURL) {
  const manifestURLObj = new URL(manifestURL);
  const manifestBaseURL =
    manifestURLObj.origin +
    manifestURLObj.pathname.substring(0, manifestURLObj.pathname.lastIndexOf('/'));
  return manifestBaseURL;
}
