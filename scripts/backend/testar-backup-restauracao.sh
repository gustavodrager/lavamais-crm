#!/usr/bin/env bash
set -euo pipefail

diretorio_script="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sufixo="${RANDOM}_$$"
banco_origem="lavamais_teste_backup_origem_${sufixo}"
banco_destino="lavamais_teste_backup_destino_${sufixo}"
diretorio_temporario="$(mktemp -d)"
arquivo="$diretorio_temporario/lavamais.dump"

limpar() {
  dropdb --if-exists --force "$banco_origem" >/dev/null 2>&1 || true
  dropdb --if-exists --force "$banco_destino" >/dev/null 2>&1 || true
  rm -rf "$diretorio_temporario"
}
trap limpar EXIT

createdb "$banco_origem"
createdb "$banco_destino"
psql --dbname="$banco_origem" --set=ON_ERROR_STOP=1 --command="CREATE TABLE verificacao_backup (valor text NOT NULL); INSERT INTO verificacao_backup VALUES ('restauracao_confirmada');" >/dev/null
"$diretorio_script/criar-backup-postgres.sh" "$banco_origem" "$arquivo"
"$diretorio_script/restaurar-backup-postgres.sh" "$banco_destino" "$arquivo"

resultado="$(psql --dbname="$banco_destino" --tuples-only --no-align --command="SELECT valor FROM verificacao_backup;")"
if [[ "$resultado" != "restauracao_confirmada" ]]; then
  echo "A verificacao da restauracao falhou." >&2
  exit 1
fi

echo "Backup e restauracao validados em bancos temporarios isolados."
