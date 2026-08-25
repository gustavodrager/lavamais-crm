import type {
  ResumoAcaoComercial,
  DetalheAcaoComercial,
  OpcaoItemDeCatalogo,
  OpcaoModeloDeMensagem,
  ResumoCliente,
  DetalheCliente,
  ResultadoPaginado,
  CriteriosDeSegmentacao,
  SimulacaoDePublico,
  ResultadoComercial,
  PreVisualizacaoImportacao,
  ResultadoImportacao,
  ResumoMovimentacaoComercial,
} from "@/contratos/apresentacao";

export interface ConsultarAcoesComerciais {
  listarAcoes(): Promise<ResultadoPaginado<ResumoAcaoComercial>>;
  obter(id: string): Promise<DetalheAcaoComercial | null>;
}

export interface ConsultarClientes {
  listarClientes(busca?: string, pagina?: number, tamanhoPagina?: number): Promise<ResultadoPaginado<ResumoCliente>>;
  obterCliente(id: string): Promise<DetalheCliente | null>;
  criarCliente(entrada: { nome: string; whatsapp: string; tipo: string | null; permiteMarketingWhatsapp: boolean; endereco: { bairro: string | null; cidade: string | null }; codigoExterno: string | null }): Promise<{ id: string }>;
}

export interface ImportarClientes {
  preVisualizarImportacao(arquivo: File): Promise<PreVisualizacaoImportacao>;
  confirmarImportacao(referenciaArquivo: string): Promise<ResultadoImportacao>;
}

export interface AdministrarConfiguracoes {
  listarCatalogo(): Promise<Array<{ id: string; nome: string; tipo: "Produto" | "Servico"; categoria: string | null; valorReferencia: number | null; situacao: "Ativo" | "Inativo"; codigoExterno: string | null }>>;
  criarServico(entrada: { nome: string; categoria: string | null; valorReferencia: number | null; codigoExterno: string | null }): Promise<{ id: string }>;
  listarEtiquetas(): Promise<Array<{ id: string; nome: string }>>;
  criarEtiqueta(nome: string): Promise<{ id: string }>;
  criarEPublicarModelo(entrada: { nome: string; conteudoPreVisualizacao: string; chaveTemplateNotificacao: string }): Promise<{ id: string }>;
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
  itemDeCatalogoId: string | null;
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
}

export interface EnviarMensagemIndividual {
  enviarDestinatario(id: string, destinatarioId: string, versao: number): Promise<{ id: string; situacaoEnvio: "AguardandoSolicitacao"; versao: number }>;
}

export interface RegistrarResultadoComercial {
  registrarResultado(id: string, destinatarioId: string, resultado: Exclude<ResultadoComercial, "NaoInformado">, valorConvertido: number | null, versao: number): Promise<void>;
}

export interface AdministrarMovimentacoesComerciais {
  listarMovimentacoes(clienteId?: string, limite?: number): Promise<ResumoMovimentacaoComercial[]>;
  registrarMovimentacao(entrada: { clienteId: string; itemDeCatalogoId: string; valorTotal: number; dataMovimentacao: string | null; codigoExterno: string | null; observacao: string | null }): Promise<{ id: string }>;
}

// Implementacoes reais pertencem ao servidor/BFF e nunca devem receber tenantId do navegador.
export interface PortaCrmApi
  extends ConsultarAcoesComerciais,
    ConsultarClientes,
    ImportarClientes,
    AdministrarConfiguracoes,
    ConsultarCatalogo,
    ConsultarModelosDeMensagem,
    CriarAcaoComercial,
    AtualizarESimularPublico,
    PrepararAcaoComercial,
    EnviarMensagemIndividual,
    RegistrarResultadoComercial,
    AdministrarMovimentacoesComerciais {}
