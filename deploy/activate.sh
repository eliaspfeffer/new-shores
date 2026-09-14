#!/bin/bash
# Installed root-owned; never execute repository scripts as root.
set -euo pipefail
state=/var/lib/new-shores-deploy
[ -f "$state/candidate" ] || exit 0
revision=$(<"$state/candidate")
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 1
if [ -f "$state/deployed" ] && [ "$(<"$state/deployed")" = "$revision" ]; then exit 0; fi
target="$state/releases/$revision"
[ -f "$target/dist/index.html" ] && [ -f "$target/server/app.mjs" ] || exit 1
previous=$(readlink /opt/new-shores-current)
ln -s "$target" /opt/new-shores-next
mv -Tf /opt/new-shores-next /opt/new-shores-current
systemctl restart new-shores.service
for attempt in {1..15}; do
  if curl --fail --silent --max-time 2 http://127.0.0.1:8791/api/health >/dev/null; then
    printf '%s\n' "$revision" > "$state/deployed"
    echo "Deployed $revision"
    exit 0
  fi
  sleep 1
done
ln -s "$previous" /opt/new-shores-next
mv -Tf /opt/new-shores-next /opt/new-shores-current
systemctl restart new-shores.service
echo 'Health check failed; previous release restored' >&2
exit 1
