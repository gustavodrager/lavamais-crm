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
if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
  docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" pg_dump --username="${PGUSER:-postgres}" --dbname="$banco" --format=custom --no-owner --no-acl >"$destino"
else
  pg_dump --dbname="$banco" --format=custom --no-owner --no-acl --file="$destino"
fi
chmod 600 "$destino"
if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
  docker exec -i "$LAVAMAIS_POSTGRES_CONTAINER" pg_restore --list <"$destino" >/dev/null
else
  pg_restore --list "$destino" >/dev/null
fi
echo "Backup criado e validado: $destino"
