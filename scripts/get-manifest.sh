#!/usr/bin/env bash

set -euo pipefail

TESTPACK_ID=$1
MANIFESTS=$(find src -name 'manifest.json' -print)

for MANIFEST in $MANIFESTS; do
  if jq -e \
    --arg id "$TESTPACK_ID" \
    '(.tags["testpack-id"] // []) | index($id) != null' \
    "$MANIFEST" >/dev/null 2>&1
  then
    printf './%s\n' "$MANIFEST"
    exit 0
  fi
done

printf 'No manifest found for Testpack ID: %s\n' "$TESTPACK_ID" >&2
exit 1
