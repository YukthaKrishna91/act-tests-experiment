#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

WASM_TESTS_DIR="src/web-apis/webassembly"

require_tool() {
  command -v "$1" >/dev/null 2>&1 || { echo "error: $1 not found in PATH (install wabt)" >&2; exit 1; }
}
require_tool wat2wasm
require_tool wast2json

assemble_wat() {
  local src="$1" out="$2"
  wat2wasm --enable-extended-const "$src" -o "$out"
  command -v wasm-strip >/dev/null 2>&1 && wasm-strip "$out"
}

assemble_wast() {
  local src="$1" out="$2" tmpdir
  tmpdir="$(mktemp -d)"
  wast2json --enable-all "$src" -o "$tmpdir/out.json" >/dev/null
  cp "$tmpdir/out.0.wasm" "$out"
  rm -rf "$tmpdir"
  command -v wasm-strip >/dev/null 2>&1 && wasm-strip "$out"
}

verify_duplicates_match() {
  local fail=0
  local files basenames name first matching path
  files="$(find "$WASM_TESTS_DIR" -mindepth 2 -maxdepth 2 -name '*.wat' | sort)"
  [[ -z "$files" ]] && return 0
  basenames="$(echo "$files" | xargs -n1 basename | sort -u)"
  for name in $basenames; do
    matching="$(echo "$files" | grep "/$name$" || true)"
    first="$(echo "$matching" | head -n1)"
    while IFS= read -r path; do
      [[ -z "$path" || "$path" == "$first" ]] && continue
      if ! cmp -s "$first" "$path"; then
        echo "error: duplicate $name files differ:" >&2
        echo "  $first" >&2
        echo "  $path" >&2
        fail=1
      fi
    done <<< "$matching"
  done
  return $fail
}

verify_duplicates_match

echo "Assembling WASM modules..."
count=0
for src in "$WASM_TESTS_DIR"/*/*.wat "$WASM_TESTS_DIR"/*/*.wast; do
  [[ -e "$src" ]] || continue
  out="$(dirname "$src")/module.wasm"
  case "$src" in
    *.wat)  assemble_wat  "$src" "$out" ;;
    *.wast) assemble_wast "$src" "$out" ;;
  esac
  echo "  $src -> $out"
  count=$((count + 1))
done

echo "Done. Assembled $count modules."
