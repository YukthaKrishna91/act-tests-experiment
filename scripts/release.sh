#!/bin/sh

next_version="${1?next version must be provided}"

npm version "${next_version}"

git push origin main --no-verify

git push --tags origin main --no-verify
