#!/bin/bash
# Keep the active release and the three newest rollback candidates.
set -euo pipefail
release_root=/var/lib/new-shores-deploy/releases
active=$(readlink -f /opt/new-shores-current)
mapfile -t keep < <(find "$release_root" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | head -4 | cut -d' ' -f2-)

while IFS= read -r -d '' path; do
  name=${path##*/}
  [[ "$name" =~ ^[a-f0-9]{40}$ ]] || continue
  [[ "$path" = "$active" ]] && continue
  preserved=false
  for candidate in "${keep[@]}"; do [[ "$path" = "$candidate" ]] && preserved=true; done
  $preserved || rm -rf -- "$path"
done < <(find "$release_root" -mindepth 1 -maxdepth 1 -type d -print0)

