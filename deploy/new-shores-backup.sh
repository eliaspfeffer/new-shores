#!/bin/bash
# Root-owned database backup with an immediate integrity check.
set -euo pipefail

backup_root=/var/backups/new-shores
stamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$backup_root/$stamp"
install -d -m 0700 "$backup_root" "$target"

set -a
. /etc/new-shores.env
set +a

# The application reaches PostgreSQL through a host-only port. pg_dump runs
# inside the existing database container, so only host and port are rewritten.
container_url=$(node -e 'const u=new URL(process.env.DATABASE_URL);u.hostname="127.0.0.1";u.port="5432";process.stdout.write(u.href)')
dump="$target/new-shores.dump"
docker exec -e DATABASE_URL="$container_url" database-platform-postgres \
  pg_dump "$container_url" --format=custom --no-owner --no-acl > "$dump"
chmod 0600 "$dump"
sha256sum "$dump" > "$target/SHA256SUMS"
docker exec -i database-platform-postgres pg_restore --list < "$dump" >/dev/null

# Keep two weeks of daily backups. Only timestamp-named children of this
# dedicated backup directory are eligible for removal.
find "$backup_root" -mindepth 1 -maxdepth 1 -type d \
  -name '????????T??????Z' -mtime +14 -exec rm -rf -- {} +

