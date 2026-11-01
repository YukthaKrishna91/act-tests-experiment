# Usage: jq --raw-output --null-input --from-file <this> <...manifests_json>

# HEADERS
# ---
[ 
  "ACT ID",
  "Title",
  "Spec Requirement"
],
# FILTERS
# ---
(
  inputs |
  select((.tags.["testpack-id"] | length) != 0) |
# VALUES
# ---
  [
    .tags.["testpack-id"].[0],
    .title,
    .tags.["spec-requirement"]
  ]
) |
@csv