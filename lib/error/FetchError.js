export class FetchError extends Error {
  constructor(message, type, options = {}) {
    super(message, options);
    this.name = 'FetchError';
    this.type = type;
  }
}

export const FetchErrorType = {
  BAD_RESPONSE: 'BAD_RESPONSE',
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  JSON_PARSE_FAILURE: 'JSON_PARSE_FAILURE'
};
