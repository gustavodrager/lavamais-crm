import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { z } from "zod";
import type { SessaoApresentacao } from "@/contratos/apresentacao";

export interface SessaoServidor {
  apresentacao: SessaoApresentacao;
  accessToken: string;
  expiraEm: number;
}

declare global {
  var __lavamaisSessoes: Map<string, SessaoServidor> | undefined;
  var __lavamaisPoolSessoes: Pool | undefined;
}

const sessoesEmMemoria = globalThis.__lavamaisSessoes ??= new Map();
const esquemaId = z.string().uuid();

function configuracaoCompartilhada() {
  const conexao = process.env.LAVAMAIS_SESSOES_DATABASE_URL;
  const chaveBase64 = process.env.LAVAMAIS_CHAVE_CRIPTOGRAFIA_SESSAO;
  if (!conexao && !chaveBase64 && process.env.NODE_ENV !== "production") return null;
  if (!conexao || !chaveBase64) throw new Error("Sessoes compartilhadas nao configuradas.");
  const chave = Buffer.from(chaveBase64, "base64");
  if (chave.length !== 32) throw new Error("A chave de criptografia das sessoes deve possuir 32 bytes em Base64.");
  const pool = globalThis.__lavamaisPoolSessoes ??= new Pool({ connectionString: conexao, max: 5, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 });
  return { pool, chave };
}

function criptografar(valor: unknown, chave: Buffer) {
  const nonce = randomBytes(12); const cifrador = createCipheriv("aes-256-gcm", chave, nonce);
  const conteudo = Buffer.concat([cifrador.update(JSON.stringify(valor), "utf8"), cifrador.final()]);
  return Buffer.concat([nonce, cifrador.getAuthTag(), conteudo]).toString("base64");
}

function descriptografar<T>(valor: string, chave: Buffer): T {
  const dados = Buffer.from(valor, "base64"); const nonce = dados.subarray(0, 12); const etiqueta = dados.subarray(12, 28); const conteudo = dados.subarray(28);
  const decifrador = createDecipheriv("aes-256-gcm", chave, nonce); decifrador.setAuthTag(etiqueta);
  return JSON.parse(Buffer.concat([decifrador.update(conteudo), decifrador.final()]).toString("utf8")) as T;
}

export async function salvarSessao(id: string, sessao: SessaoServidor, cliente?: PoolClient) {
  const configuracao = configuracaoCompartilhada(); if (!configuracao) { sessoesEmMemoria.set(id, sessao); return; }
  const executor = cliente ?? configuracao.pool;
  await executor.query("INSERT INTO web.sessoes (id, conteudo, expira_em) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET conteudo = EXCLUDED.conteudo, expira_em = EXCLUDED.expira_em", [id, criptografar(sessao, configuracao.chave), new Date(sessao.expiraEm)]);
  await executor.query("DELETE FROM web.sessoes WHERE expira_em <= NOW()");
}

export async function obterSessao(id: string, cliente?: PoolClient): Promise<SessaoServidor | undefined> {
  if (!esquemaId.safeParse(id).success) return undefined;
  const configuracao = configuracaoCompartilhada();
  if (!configuracao) {
    const sessao = sessoesEmMemoria.get(id);
    if (sessao && sessao.expiraEm > Date.now()) return sessao;
    sessoesEmMemoria.delete(id);
    return undefined;
  }
  const resultado = await (cliente ?? configuracao.pool).query<{ conteudo: string }>("SELECT conteudo FROM web.sessoes WHERE id = $1 AND expira_em > NOW()", [id]);
  return resultado.rowCount ? descriptografar<SessaoServidor>(resultado.rows[0].conteudo, configuracao.chave) : undefined;
}

export async function excluirSessao(id: string, cliente?: PoolClient) {
  if (!esquemaId.safeParse(id).success) return;
  const configuracao = configuracaoCompartilhada(); if (!configuracao) { sessoesEmMemoria.delete(id); return; }
  await (cliente ?? configuracao.pool).query("DELETE FROM web.sessoes WHERE id = $1", [id]);
}
