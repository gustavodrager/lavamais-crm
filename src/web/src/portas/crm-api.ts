import type {
  ResumoAcaoComercial,
  DetalheAcaoComercial,
  OpcaoItemDeCatalogo,
  OfertaDoCatalogoDeLavanderia,
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
  RoteiroDiario,
} from "@/contratos/apresentacao";

export interface ConsultarAcoesComerciais {
  listarAcoes(): Promise<ResultadoPaginado<ResumoAcaoComercial>>;
  obter(id: string): Promise<DetalheAcaoComercial | null>;
}

export interface ConsultarClientes {
  listarClientes(busca?: string, pagina?: number, tamanhoPagina?: number): Promise<ResultadoPaginado<ResumoCliente>>;
  obterCliente(id: string): Promise<DetalheCliente | null>;
  criarCliente(entrada: DadosMutaveisCliente): Promise<{ id: string }>;
  atualizarCliente(id: string, entrada: DadosMutaveisCliente): Promise<void>;
}

export interface DadosMutaveisCliente {
  nome: string;
  whatsapp: string;
  nomeFantasia: string | null;
  tipo: string | null;
  email: string | null;
  dataNascimento: string | null;
  permiteMarketingWhatsapp: boolean;
  endereco: {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  } | null;
  etiquetaIds: string[];
  codigoExterno: string | null;
  dataCadastroOrigem: string | null;
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
}

export interface AdministrarModelosDeMensagem {
  criarEPublicarModelo(entrada: { nome: string; conteudoPreVisualizacao: string }): Promise<{ id: string }>;
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
  versaoModeloId: string | null;
  criterios: CriteriosDeSegmentacao;
}

export interface CriarAcaoComercial {
  criar(entrada: CriarAcaoComercialEntrada): Promise<{ id: string }>;
  atualizarAcao(id: string, entrada: CriarAcaoComercialEntrada): Promise<void>;
}

export interface AtualizarESimularPublico {
  atualizarCriterios(id: string, criterios: CriteriosDeSegmentacao): Promise<void>;
  simularPublico(id: string, pagina?: number, tamanhoPagina?: number): Promise<SimulacaoDePublico>;
}

export interface PrepararAcaoComercial {
  atualizarModelo(id: string, versaoModeloId: string): Promise<void>;
  preparar(id: string, versao: number): Promise<void>;
  cancelarAcao(id: string, motivo: string, versao: number): Promise<void>;
}

export interface EnviarMensagemIndividual {
  registrarAberturaWhatsapp(id: string, destinatarioId: string, versao: number): Promise<void>;
  confirmarEnvioWhatsapp(id: string, destinatarioId: string, versao: number): Promise<{ id: string; situacaoEnvio: "Enviado"; dataEnvioConfirmado: string; versao: number }>;
}

export interface RegistrarResultadoComercial {
  registrarResultado(id: string, destinatarioId: string, resultado: Exclude<ResultadoComercial, "NaoInformado">, valorConvertido: number | null, versao: number): Promise<void>;
}

export interface AdministrarMovimentacoesComerciais {
  listarOfertasDoCatalogoDeLavanderia(): Promise<OfertaDoCatalogoDeLavanderia[]>;
  carregarCatalogoInicialDeLavanderia(): Promise<{ artigosCriados: number; servicosCriados: number; ofertasCriadas: number }>;
  listarMovimentacoes(clienteId?: string, limite?: number): Promise<ResumoMovimentacaoComercial[]>;
  registrarMovimentacao(entrada: { clienteId: string; linhas: Array<{ ofertaDeServicoId: string; quantidade: number; precoUnitario: number | null }>; dataMovimentacao: string | null; codigoExterno: string | null; observacao: string | null }): Promise<{ id: string }>;
  cancelarMovimentacao(id: string, motivo: string, versao: number): Promise<void>;
}

export interface AdministrarRoteiros {
  obterRoteiro(data: string): Promise<RoteiroDiario | null>;
  criarRoteiro(data: string, nomeMotorista: string): Promise<{ id: string }>;
  atualizarMotorista(roteiroId: string, nomeMotorista: string, versao: number): Promise<void>;
  excluirRoteiro(roteiroId: string, versao: number): Promise<void>;
  adicionarParada(roteiroId: string, entrada: { clienteId: string; tipo: "Coleta" | "Entrega"; periodo: string; observacao: string | null; versao: number }): Promise<void>;
  atualizarParada(roteiroId: string, paradaId: string, entrada: { tipo: "Coleta" | "Entrega"; periodo: string; observacao: string | null; versao: number }): Promise<void>;
  removerParada(roteiroId: string, paradaId: string, versao: number): Promise<void>;
  reordenarParadas(roteiroId: string, paradaIds: string[], versao: number): Promise<void>;
  publicarRoteiro(roteiroId: string, versao: number): Promise<void>;
  iniciarParada(id: string, versao: number): Promise<void>;
  concluirParada(id: string, versao: number): Promise<void>;
  adiarParada(id: string, versao: number): Promise<void>;
  naoRealizarParada(id: string, motivo: string, versao: number): Promise<void>;
}

// Implementacoes reais pertencem ao servidor/BFF e nunca devem receber tenantId do navegador.
export interface PortaCrmApi
  extends ConsultarAcoesComerciais,
    ConsultarClientes,
    ImportarClientes,
    AdministrarConfiguracoes,
    AdministrarModelosDeMensagem,
    ConsultarCatalogo,
    ConsultarModelosDeMensagem,
    CriarAcaoComercial,
    AtualizarESimularPublico,
    PrepararAcaoComercial,
    EnviarMensagemIndividual,
    RegistrarResultadoComercial,
    AdministrarMovimentacoesComerciais,
    AdministrarRoteiros {}
