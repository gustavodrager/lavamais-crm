CREATE SCHEMA IF NOT EXISTS web;

CREATE TABLE IF NOT EXISTS web.sessoes (
    id uuid PRIMARY KEY,
    conteudo text NOT NULL,
    expira_em timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_sessoes_expira_em ON web.sessoes (expira_em);

CREATE TABLE IF NOT EXISTS web.estados_oidc (
    id uuid PRIMARY KEY,
    conteudo text NOT NULL,
    expira_em timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_estados_oidc_expira_em ON web.estados_oidc (expira_em);
