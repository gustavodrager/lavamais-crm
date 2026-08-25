CREATE SCHEMA IF NOT EXISTS web;

CREATE TABLE IF NOT EXISTS web.sessoes (
    id uuid PRIMARY KEY,
    conteudo text NOT NULL,
    expira_em timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_sessoes_expira_em ON web.sessoes (expira_em);
