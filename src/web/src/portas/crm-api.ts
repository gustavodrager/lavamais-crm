import type {
  ResumoAcaoComercial,
  DetalheAcaoComercial,
  OpcaoItemDeCatalogo,
  OpcaoModeloDeMensagem,
  ResumoCliente,
  ResultadoPaginado,
  CriteriosDeSegmentacao,
  SimulacaoDePublico,
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

export interface ConsultarModelosDeMensagem {
  listarModelosPublicados(): Promise<OpcaoModeloDeMensagem[]>;
}

export interface CriarAcaoComercialEntrada {
  nome: string;
  objetivo: string;
  itemDeCatalogoId: string;
  versaoModeloId: null;
  criterios: CriteriosDeSegmentacao;
}

export interface CriarAcaoComercial {
  criar(entrada: CriarAcaoComercialEntrada): Promise<{ id: string }>;
}

export interface AtualizarESimularPublico {
  atualizarCriterios(id: string, criterios: CriteriosDeSegmentacao): Promise<void>;
  simularPublico(id: string, pagina?: number, tamanhoPagina?: number): Promise<SimulacaoDePublico>;
}

export interface PrepararAcaoComercial {
  atualizarModelo(id: string, versaoModeloId: string): Promise<void>;
  preparar(id: string, versao: number): Promise<void>;
  iniciar(id: string, versao: number): Promise<void>;
}

// Implementacoes reais pertencem ao servidor/BFF e nunca devem receber tenantId do navegador.
export interface PortaCrmApi
  extends ConsultarAcoesComerciais,
    ConsultarClientes,
    ConsultarCatalogo,
    ConsultarModelosDeMensagem,
    CriarAcaoComercial,
    AtualizarESimularPublico,
    PrepararAcaoComercial {}
