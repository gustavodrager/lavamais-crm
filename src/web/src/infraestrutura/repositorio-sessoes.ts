import "server-only";

import type { SessaoApresentacao } from "@/contratos/apresentacao";

export interface SessaoServidor {
  apresentacao: SessaoApresentacao;
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiraEm: number;
}

export interface EstadoOidc { state: string; nonce: string; verificadorPkce: string; retorno: string; }

declare global {
  var __lavamaisSessoes: Map<string, SessaoServidor> | undefined;
  var __lavamaisEstadosOidc: Map<string, EstadoOidc> | undefined;
}

export const sessoes = globalThis.__lavamaisSessoes ??= new Map();
export const estadosOidc = globalThis.__lavamaisEstadosOidc ??= new Map();
