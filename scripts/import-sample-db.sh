#!/usr/bin/env bash
set -euo pipefail

SQL_PATH="${1:-data/studenthub-sample.sql}"
CONTAINER="${CONTAINER:-studenthub-next-mysql}"
DATABASE="${DATABASE:-studenthub_sample}"
USER="${USER_NAME:-studenthub}"
PASSWORD="${PASSWORD:-studenthub}"

if [ ! -f "$SQL_PATH" ]; then
  echo "Missing SQL sample: $SQL_PATH"
  echo "Run: npm run db:create-sample"
  exit 1
fi

docker exec -i "$CONTAINER" mysql -u"$USER" -p"$PASSWORD" "$DATABASE" < "$SQL_PATH"
