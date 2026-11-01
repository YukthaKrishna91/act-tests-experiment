#!/bin/sh

# Creates a new ACT ID in the ACT database for the provided test and
# updates the manifest.
#
# Does nothing if the ACT test already has an ACT ID.
#
# Usage:
#   [DRY_RUN=<boolean>] ./act-id.sh {{path to local manifest}}
#
# Based on validateTest in act-test-packs (git): https://github.com/bbc/act-test-packs/blob/master/dangerfile.js#L243

manifest="${1?manifest is required}"

if ! repo_canonical="$(git rev-parse --show-toplevel)"
then
  exit 1
fi

# Generate manifests and payloads
npm run build 1>/dev/null 2>&1

if ! has_id="$(node ${repo_canonical}/scripts/lib/modules/has-act-id.js ${manifest})"
then
  exit 1
fi

if [[ "${has_id}" = "yes" ]]
then
  exit 0
fi

if ! act_id="$(node ${repo_canonical}/scripts/lib/modules/set-act-id.js --dry-run=${DRY_RUN} ${manifest})"
then
  exit 1
fi

temp="$(dirname ${manifest})/temp.$(basename ${manifest})"

jq --arg act_id "${act_id}" --null-input 'input | .tags.["testpack-id"].[0] = $act_id' "${manifest}" 1>"${temp}"

npx prettier --ignore-path "${repo_canonical}/.gitignore" --write "${temp}" 2>/dev/null

mv "${temp}" "${manifest}"
