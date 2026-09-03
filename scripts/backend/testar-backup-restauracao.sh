#!/usr/bin/env bash
set -euo pipefail

diretorio_script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sufixo="${RANDOM}_$$"
banco_origem="lavamais_teste_backup_origem_${sufixo}"
banco_destino="lavamais_teste_backup_destino_${sufixo}"
diretorio_temporario="$(mktemp -d)"
arquivo="$diretorio_temporario/lavamais.dump"

criar_banco() {
  if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
    docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" createdb --username="${PGUSER:-postgres}" "$1"
  else
    createdb "$1"
  fi
}

remover_banco() {
  if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
    docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" dropdb --username="${PGUSER:-postgres}" --if-exists --force "$1" >/dev/null 2>&1 || true
  else
    dropdb --if-exists --force "$1" >/dev/null 2>&1 || true
  fi
}

executar_sql() {
  if [[ -n "${LAVAMAIS_POSTGRES_CONTAINER:-}" ]]; then
    docker exec -e PGPASSWORD="${PGPASSWORD:-}" "$LAVAMAIS_POSTGRES_CONTAINER" psql --username="${PGUSER:-postgres}" --dbname="$1" --set=ON_ERROR_STOP=1 "${@:2}"
  else
    psql --dbname="$1" --set=ON_ERROR_STOP=1 "${@:2}"
  fi
}

limpar() {
  remover_banco "$banco_origem"
  remover_banco "$banco_destino"
  rm -rf "$diretorio_temporario"
}
trap limpar EXIT

criar_banco "$banco_origem"
criar_banco "$banco_destino"
executar_sql "$banco_origem" --command="CREATE TABLE verificacao_backup (valor text NOT NULL); INSERT INTO verificacao_backup VALUES ('restauracao_confirmada');" >/dev/null
"$diretorio_script/criar-backup-postgres.sh" "$banco_origem" "$arquivo"
LAVAMAIS_CONFIRMAR_RESTAURACAO="$banco_destino" "$diretorio_script/restaurar-backup-postgres.sh" "$banco_destino" "$arquivo"

resultado="$(executar_sql "$banco_destino" --tuples-only --no-align --command="SELECT valor FROM verificacao_backup;")"
if [[ "$resultado" != "restauracao_confirmada" ]]; then
  echo "A verificacao da restauracao falhou." >&2
  exit 1
fi

echo "Backup e restauracao validados em bancos temporarios isolados."
