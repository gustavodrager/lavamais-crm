#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: verificar-superficie-publica.sh <url-api-homologacao> <url-web-homologacao>" >&2
  exit 2
fi

url_api="${1%/}"
url_web="${2%/}"

if [[ ! "$url_api" =~ ^https:// || ! "$url_web" =~ ^https:// ]]; then
  echo "As URLs de homologacao devem usar HTTPS." >&2
  exit 2
fi

if [[ "$url_api" != *homologacao* || "$url_web" != *homologacao* ]]; then
  echo "Verificacao recusada: os dois alvos devem identificar explicitamente homologacao." >&2
  exit 2
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl nao esta disponivel." >&2
  exit 2
fi

diretorio_temporario="$(mktemp -d)"
trap 'rm -rf "$diretorio_temporario"' EXIT

falhar() {
  echo "FALHA: $1" >&2
  exit 1
}

validar_codigo() {
  local descricao="$1"
  local url="$2"
  local esperado="$3"
  local recebido
  recebido="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "$url")"
  [[ "$recebido" == "$esperado" ]] || falhar "$descricao retornou HTTP $recebido; esperado $esperado."
  echo "OK: $descricao retornou HTTP $esperado."
}

curl --fail --silent --show-error "$url_api/saude/vivo" --output "$diretorio_temporario/vivo.txt"
grep --fixed-strings --line-regexp --quiet "Healthy" "$diretorio_temporario/vivo.txt" || falhar "a API nao confirmou saude basica."
echo "OK: API viva."

curl --fail --silent --show-error "$url_api/saude/pronto" --output "$diretorio_temporario/pronto.json"
grep --fixed-strings --quiet '"situacao":"Healthy"' "$diretorio_temporario/pronto.json" || falhar "a prontidao da API nao esta saudavel."
grep --fixed-strings --quiet '"nome":"postgres","situacao":"Healthy"' "$diretorio_temporario/pronto.json" || falhar "o PostgreSQL nao esta saudavel na prontidao da API."
echo "OK: API e PostgreSQL prontos."

curl --fail --silent --show-error "$url_api/openapi/v1.json" --output "$diretorio_temporario/openapi.json"
for rota in \
  '/api/v1/clientes' \
  '/api/v1/movimentacoes-comerciais' \
  '/api/v1/roteiros' \
  '/api/v1/acoes-comerciais/{acaoId}/destinatarios/{destinatarioId}/enviar'; do
  grep --fixed-strings --quiet "$rota" "$diretorio_temporario/openapi.json" || falhar "o OpenAPI nao publicou $rota."
done
if grep --fixed-strings --quiet '/api/v1/acoes-comerciais/{id}/iniciar' "$diretorio_temporario/openapi.json"; then
  falhar "o OpenAPI ainda publica o inicio coletivo removido da Versao 1.0."
fi
echo "OK: contrato publico contem os fluxos da Versao 1.0 e nao expoe inicio coletivo."

validar_codigo "clientes sem sessao" "$url_api/api/v1/clientes" "401"
validar_codigo "movimentacoes sem sessao" "$url_api/api/v1/movimentacoes-comerciais" "401"
validar_codigo "roteiros sem sessao" "$url_api/api/v1/roteiros?data=2026-09-02" "401"
validar_codigo "capacidades sem sessao" "$url_api/api/v1/capacidades" "401"

validar_codigo "pagina de entrada" "$url_web/entrar" "200"
curl --silent --show-error --dump-header "$diretorio_temporario/web.headers" --output "$diretorio_temporario/web.html" "$url_web/entrar"
grep --fixed-strings --quiet "LavaMais" "$diretorio_temporario/web.html" || falhar "a pagina de entrada nao contem a marca esperada."
grep --extended-regexp --ignore-case --quiet "^content-security-policy:.*frame-ancestors 'none'" "$diretorio_temporario/web.headers" || falhar "CSP com bloqueio de frame ausente."
grep --extended-regexp --ignore-case --quiet '^cross-origin-opener-policy:[[:space:]]*same-origin' "$diretorio_temporario/web.headers" || falhar "Cross-Origin-Opener-Policy ausente."
grep --extended-regexp --ignore-case --quiet '^permissions-policy:[[:space:]]*camera=\(\), geolocation=\(\), microphone=\(\)' "$diretorio_temporario/web.headers" || falhar "Permissions-Policy ausente."
grep --extended-regexp --ignore-case --quiet '^referrer-policy:[[:space:]]*no-referrer' "$diretorio_temporario/web.headers" || falhar "Referrer-Policy ausente."
grep --extended-regexp --ignore-case --quiet '^x-content-type-options:[[:space:]]*nosniff' "$diretorio_temporario/web.headers" || falhar "X-Content-Type-Options ausente."
grep --extended-regexp --ignore-case --quiet '^x-frame-options:[[:space:]]*DENY' "$diretorio_temporario/web.headers" || falhar "X-Frame-Options ausente."
if grep --extended-regexp --ignore-case --quiet '^x-powered-by:' "$diretorio_temporario/web.headers"; then
  falhar "o Web/BFF ainda revela X-Powered-By."
fi
echo "OK: pagina publica protegida por cabecalhos de seguranca."

curl --silent --show-error --dump-header "$diretorio_temporario/protegida.headers" --output /dev/null "$url_web/clientes"
grep --extended-regexp --ignore-case --quiet '^HTTP/[0-9.]+ 307' "$diretorio_temporario/protegida.headers" || falhar "a rota protegida nao redirecionou com HTTP 307."
grep --extended-regexp --ignore-case --quiet '^location:[[:space:]]*/entrar' "$diretorio_temporario/protegida.headers" || falhar "a rota protegida nao redirecionou para /entrar."
echo "OK: rota protegida redireciona visitantes para a entrada."

echo "Superficie publica da homologacao validada sem autenticacao e sem escrita de dados."
