#!/bin/bash
set -euo pipefail
cd /var/lib/new-shores-deploy
export GIT_SSH_COMMAND='ssh -i /var/lib/new-shores-deploy/.ssh/github -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes'
if [ ! -d repository.git ]; then git clone --bare git@github.com:eliaspfeffer/new-shores.git repository.git; fi
git --git-dir=repository.git fetch origin main
revision=$(git --git-dir=repository.git rev-parse FETCH_HEAD)
[[ "$revision" =~ ^[a-f0-9]{40}$ ]] || exit 1
if [ -f deployed ] && [ "$(<deployed)" = "$revision" ]; then exit 0; fi
release="/var/lib/new-shores-deploy/releases/$revision"
mkdir -p "$release"
git --git-dir=repository.git archive "$revision" | tar -x -C "$release"
cd "$release"
npm ci --ignore-scripts --no-audit --no-fund
npm test
BUILD_REVISION="$revision" npm run build
printf '%s\n' "$revision" > /var/lib/new-shores-deploy/candidate
