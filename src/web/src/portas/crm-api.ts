import type {
  ResumoAcaoComercial,
  DetalheAcaoComercial,
  ResumoCliente,
  ResultadoPaginado,
} from "@/contratos/apresentacao";

export interface ConsultarAcoesComerciais {
  listarAcoes(): Promise<ResultadoPaginado<ResumoAcaoComercial>>;
  obter(id: string): Promise<DetalheAcaoComercial | null>;
}

export interface ConsultarClientes {
  listarClientes(): Promise<ResultadoPaginado<ResumoCliente>>;
}

export interface CriarAcaoComercialEntrada {
  nome: string;
  objetivo: string;
  itemCatalogoId: string;
}

export interface CriarAcaoComercial {
  criar(entrada: CriarAcaoComercialEntrada): Promise<{ id: string }>;
}

// Implementacoes reais pertencem ao servidor/BFF e nunca devem receber tenantId do navegador.
export interface PortaCrmApi
  extends ConsultarAcoesComerciais,
    ConsultarClientes,
    CriarAcaoComercial {}
