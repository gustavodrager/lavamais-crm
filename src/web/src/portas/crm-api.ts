import type {
  ResumoAcaoComercial,
  DetalheAcaoComercial,
  OpcaoItemDeCatalogo,
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

export interface ConsultarCatalogo {
  listarItensDeCatalogoAtivos(): Promise<OpcaoItemDeCatalogo[]>;
}

export interface CriarAcaoComercialEntrada {
  nome: string;
  objetivo: string;
  itemDeCatalogoId: string;
  versaoModeloId: null;
  criterios: {
    versaoSchema: 1;
    modo: "Filtros";
  };
}

export interface CriarAcaoComercial {
  criar(entrada: CriarAcaoComercialEntrada): Promise<{ id: string }>;
}

// Implementacoes reais pertencem ao servidor/BFF e nunca devem receber tenantId do navegador.
export interface PortaCrmApi
  extends ConsultarAcoesComerciais,
    ConsultarClientes,
    ConsultarCatalogo,
    CriarAcaoComercial {}
