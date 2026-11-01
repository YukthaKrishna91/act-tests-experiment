import fetchPlaybackAsset from './fetchPlaybackAsset.js';
import { fetchRMSToken } from './fetchRMSToken.js';
import { fetchParsedMediaSelection } from './fetchParsedMediaSelection.js';

export async function fetchMediaAsset(id) {
  const data = await fetchPlaybackAsset(id);

  const { media, mediatorUrl } = data;
  const isMediated = media.cvid != null || media.vpid != null;
  if (isMediated) {
    const cvid = media.cvid ?? `urn:bbc:pips:pid:${media.vpid}`;

    const mediaSelection = await fetchParsedMediaSelection(
      mediatorUrl ?? 'https://securegate.iplayer.bbc.co.uk/',
      {
        cvid,
        kind: media.kind,
        encoding: media.encoding,
        playbackQuality: media.quality,
        jwt: await fetchRMSToken(cvid, media.kind, media.streamType)
      }
    );

    // Media selection should be the same format as the media object
    return mediaSelection;
  }
  return media;
}
