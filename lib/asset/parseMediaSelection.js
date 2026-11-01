import { parse } from '@bbc/smp-media-selector';

/**
 * Parses the media selector response and returns the parsed data.
 */
export function parseMediaSelection(data, { encoding, kind, mediaSet }) {
  // Set MS_DEBUG to false by default
  globalThis.MS_DEBUG = false;

  try {
    const options = { protocols: ['https'], transferFormats: ['dash'] };

    if (typeof encoding === 'string') {
      options.encodings = { [kind]: [encoding] };
    }

    let { result, error } = parse(data, options);

    if (error != null) {
      throw new ParseError(`Failed to parse media selection: ${error}`);
    }

    return {
      kind,
      type: 'application/dash+xml',
      transferFormat: 'dash',
      mediaSet,
      urls: formatConnections(result[kind])
    };
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }

    throw new ParseError('Failed to parse media selection', { cause: error });
  }
}

function formatConnections(connections) {
  if (connections == null) return;
  return connections.map((connection) => {
    const dpw = Number.parseInt(connection.dpw, 10);

    const transformedConnection = {
      ...connection,
      url: connection.href,
      cdn: connection.supplier,
      dpw: dpw
    };

    delete transformedConnection.href;
    delete transformedConnection.supplier;

    return transformedConnection;
  });
}

export class ParseError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'ParseError';
  }
}
