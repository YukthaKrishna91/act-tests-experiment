#!/bin/sh

repo="$(git rev-parse --show-toplevel)"
branch="$(git branch --show-current)"

if [[ "${branch}" = "main" ]]
then
  printf 'No good diff baseline for main branch. Prefer using build-test-url.js directly.\n'
  exit 1
fi

changed_files="$(git --no-pager diff -z --name-only main...HEAD | tr '\0' ' ')"

node "${repo}/scripts/build-test-url.js" --version "branch=${branch}" --cert-domain 'test' ${changed_files}
