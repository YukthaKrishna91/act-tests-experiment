const VERSION_MATCHER =
  /(?<specMajor>0|[1-9]\d*)\.(?<specMinor>0|[1-9]\d*)\.(?<specPatch>0|[1-9]\d*)-(?<repoCounter>0|[1-9]\d*)/;

const BRANCH_MATCHER = /[0-9A-Za-z\-_]+/;

export function createSemverMatcher() {
  return new RegExp(`^${VERSION_MATCHER.source}$`);
}

export function createVersionTagMatcher() {
  return new RegExp(`^v${VERSION_MATCHER.source}$`);
}

export function createPrBuildNameMatcher() {
  return new RegExp(`^branch=${BRANCH_MATCHER.source}$`);
}

export function isValidVersion(string) {
  return (
    (typeof string === 'string' && string === 'latest') ||
    createVersionTagMatcher().test(string) ||
    createPrBuildNameMatcher().test(string)
  );
}
