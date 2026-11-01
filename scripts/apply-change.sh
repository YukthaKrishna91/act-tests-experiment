#!/bin/sh

# Usage: apply-change.sh <patch_file> <...manifest_files>
#   - The patch file must be a JSON changelog entry with "version", "change-type", and "summary"

patchfile="${1}"

shift

for manifest in "${@}"
do
  jq '.changelog |= [input] + .' "${manifest}" "${patchfile}" > "${manifest}.temp"

  if cmp -s "${manifest}" "${manifest}.temp"
  then
    rm "${manifest}.temp"
    continue
  fi

  mv "${manifest}.temp" "${manifest}"
done