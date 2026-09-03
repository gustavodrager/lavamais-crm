#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: criar-backup-postgres.sh <banco> <arquivo.dump>" >&2
  exit 2
fi

banco="$1"
destino="$2"
if [[ ! "$banco" =~ ^[a-zA-Z0-9_]+$ ]]; then
  echo "Nome de banco invalido." >&2
  exit 2
fi

mkdir -p "$(dirname "$destino")"
umask 077
if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
  docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" pg_dump --username="${PGUSER:-postgres}" --dbname="$banco" --format=custom --no-owner --no-acl >"$destino"
elif [[ -n "${LAVAMAIS_POSTGRES_URL:-}" ]]; then
  pg_dump --dbname="$LAVAMAIS_POSTGRES_URL" --format=custom --no-owner --no-acl --file="$destino"
else
  pg_dump --dbname="$banco" --format=custom --no-owner --no-acl --file="$destino"
fi
chmod 600 "$destino"
if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
  docker exec -i "$LAVAMAIS_POSTGRES_CONTAINER" pg_restore --list <"$destino" >/dev/null
else
  pg_restore --list "$destino" >/dev/null
fi
if command -v sha256sum >/dev/null 2>&1; then
  (cd "$(dirname "$destino")" && sha256sum "$(basename "$destino")") >"$destino.sha256"
else
  (cd "$(dirname "$destino")" && shasum -a 256 "$(basename "$destino")") >"$destino.sha256"
fi
chmod 600 "$destino.sha256"
echo "Backup criado, validado e acompanhado de checksum: $destino"
