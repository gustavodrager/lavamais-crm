#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: restaurar-backup-postgres.sh <banco-destino> <arquivo.dump>" >&2
  exit 2
fi

banco="$1"
origem="$2"
if [[ ! "$banco" =~ ^[a-zA-Z0-9_]+$ || ! -f "$origem" ]]; then
  echo "Banco ou arquivo de backup invalido." >&2
  exit 2
fi

if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
  docker exec -i -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" pg_restore --username="${PGUSER:-postgres}" --dbname="$banco" --clean --if-exists --no-owner --no-acl --exit-on-error <"$origem"
else
  pg_restore --dbname="$banco" --clean --if-exists --no-owner --no-acl --exit-on-error "$origem"
fi
echo "Backup restaurado no banco: $banco"
