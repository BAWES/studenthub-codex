#!/usr/bin/env bash
set -euo pipefail

DUMP_PATH="${1:-../StudentHub Backup.sql}"
CONTAINER="${CONTAINER:-studenthub-next-mysql}"
DATABASE="${DATABASE:-studenthub_prod_local}"
APP_USER="${APP_USER:-studenthub}"
ROOT_PASSWORD="${ROOT_PASSWORD:-studenthub_root}"

if [ ! -f "$DUMP_PATH" ]; then
  echo "Missing production dump: $DUMP_PATH"
  exit 1
fi

echo "Creating local-only database: $DATABASE"
docker exec -i "$CONTAINER" mysql -uroot -p"$ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON \`$DATABASE\`.* TO '$APP_USER'@'%';
FLUSH PRIVILEGES;
SQL

echo "Importing raw production backup into local Docker MySQL. This can take a few minutes."
docker exec -i "$CONTAINER" mysql -uroot -p"$ROOT_PASSWORD" "$DATABASE" < "$DUMP_PATH"
echo "Imported $DUMP_PATH into $DATABASE"
