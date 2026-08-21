import "server-only";

import { CrmApiHttp } from "@/infraestrutura/crm-api-http";
import { obterAccessToken } from "@/infraestrutura/sessao-oidc";
import type { PortaCrmApi } from "@/portas/crm-api";

export function obterPortaCrmApi(): PortaCrmApi {
  const urlBase = process.env.LAVAMAIS_CRM_API_URL;
  if (!urlBase) throw new Error("LAVAMAIS_CRM_API_URL deve ser configurada para usar a CRM API.");
  return new CrmApiHttp(urlBase, obterAccessToken);
}
