export type SituacaoAcaoComercial =
  | "Rascunho"
  | "Preparada"
  | "EmProcessamento"
  | "Concluida"
  | "ConcluidaComFalhas"
  | "Cancelada";

export interface ResumoAcaoComercial {
  id: string;
  nome: string;
  objetivo: string | null;
  itemDeCatalogoId: string | null;
  versaoModeloId: string | null;
  criterios: CriteriosDeSegmentacao;
  situacao: SituacaoAcaoComercial;
  totalDestinatarios: number | null;
  quantidadeDestinatarios?: number | null;
  mensagensParaEnviar: number;
  retornosParaRegistrar: number;
  resultadosRegistrados: number;
  dataAtualizacao: string;
  versao: number;
}

export interface CriteriosDeSegmentacao {
  versaoSchema: 1 | 2;
  modo: "Filtros" | "Manual";
  tipoCliente: string | null;
  cidades: string[] | null;
  bairros: string[] | null;
  etiquetaIds: string[] | null;
  cadastradoApartirDe: string | null;
  dataNascimentoDe: string | null;
  dataNascimentoAte: string | null;
  clienteIds: string[] | null;
  clienteIdsExcluidos: string[] | null;
}

export type MotivoExclusaoPublico =
  | "ClienteInativo"
  | "ContatoInvalido"
  | "SemPermissao"
  | "ContatoDuplicado"
  | "ExcluidoManualmente";

export interface ClienteSimulado {
  clienteId: string;
  nome: string;
  whatsapp: string | null;
  elegivel: boolean;
  motivoExclusao: MotivoExclusaoPublico | null;
}

export interface SimulacaoDePublico {
  quantidadeEncontrada: number;
  quantidadeElegivel: number;
  pagina: number;
  tamanhoPagina: number;
  clientes: ClienteSimulado[];
}

export interface DetalheAcaoComercial extends ResumoAcaoComercial {
  totais: {
    destinatarios: number;
    pendentes: number;
    enviados: number;
    naoInformados: number;
    semRetorno: number;
    responderam: number;
    interessados: number;
    convertidos: number;
    semInteresse: number;
    valorConvertido: number;
  };
  destinatarios: DestinatarioDaAcao[];
}

export type SituacaoEnvio = "Pendente" | "Enviado";
export type ResultadoComercial = "NaoInformado" | "SemRetorno" | "Respondeu" | "Interessado" | "Convertido" | "NaoTemInteresse";
export interface DestinatarioDaAcao {
  id: string;
  clienteId: string;
  nomeCliente: string;
  destino: string;
  conteudoPreVisualizacao: string;
  situacaoEnvio: SituacaoEnvio;
  dataEnvioConfirmado: string | null;
  resultadoComercial: ResultadoComercial;
  valorConvertido: number | null;
  dataResultadoComercial: string | null;
  versao: number;
}

export interface ResumoCliente {
  id: string;
  nome: string;
  whatsapp: string;
  localidade: string;
  quantidadeEtiquetas: number;
  permiteWhatsapp: boolean;
  temEnderecoOperacional?: boolean;
  situacao: "Ativo" | "Inativo";
  codigoExterno: string | null;
}

export interface DetalheCliente extends ResumoCliente {
  nomeFantasia: string | null;
  tipo: string | null;
  email: string | null;
  dataNascimento: string | null;
  etiquetaIds: string[];
  dataCadastroOrigem: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  endereco: {
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    cep: string | null;
  } | null;
}

export interface PreVisualizacaoImportacao {
  referenciaArquivo: string;
  colunas: string[];
  totalLinhas: number;
  amostra: Array<{ numero: number; valores: string[]; erros: string[] }>;
}

export interface ResultadoImportacao {
  id: string;
  situacao: string;
  totalLinhas: number;
  totalInseridas: number;
  totalAtualizadas: number;
  totalRejeitadas: number;
  linhas: Array<{
    numero: number;
    resultado: string;
    clienteId: string | null;
    erro: string | null;
  }>;
}

export interface OpcaoItemDeCatalogo {
  id: string;
  nome: string;
  tipo: "Produto" | "Servico";
  categoria: string | null;
}

export interface OfertaDoCatalogoDeLavanderia {
  id: string;
  artigoDeLavanderiaId: string;
  nomeArtigo: string;
  categoria: string;
  servicoDeLavanderiaId: string;
  nomeServico: string;
  precoUnitario: number;
}

export interface OpcaoModeloDeMensagem {
  modeloId: string;
  versaoId: string;
  nome: string;
  numeroVersao: number;
  canal: "Whatsapp";
  conteudoPreVisualizacao: string;
  variaveis: string[];
}

export interface SessaoApresentacao {
  usuario: { nome: string; iniciais: string };
  tenant: { nome: string };
  papel?: "Administrador" | "Gerente" | "Operador";
  papelVisualizado?: "Administrador" | "Gerente" | "Operador";
  autenticacaoDesabilitada?: boolean;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  total: number;
}

export interface ResumoMovimentacaoComercial {
  id: string;
  clienteId: string;
  nomeCliente: string;
  valorTotal: number;
  dataMovimentacao: string;
  codigoExterno: string | null;
  observacao: string | null;
  origem: "Recepcao" | "ImportacaoEssence" | "IntegracaoEssence";
  situacao: "Registrada" | "Cancelada";
  versao: number;
  linhas: Array<{
    id: string;
    ofertaDeServicoId: string;
    artigoDeLavanderiaId: string;
    nomeArtigo: string;
    servicoDeLavanderiaId: string;
    nomeServico: string;
    quantidade: number;
    precoTabela: number;
    precoUnitario: number;
    subtotal: number;
  }>;
}

export interface RoteiroDiario {
  id: string;
  data: string;
  nomeMotorista: string;
  situacao: "EmPreparacao" | "Publicado" | "EmAndamento" | "Finalizado";
  versao: number;
  paradas: Array<{
    id: string; clienteId: string; nomeCliente: string; whatsapp: string; enderecoCompleto: string;
    tipo: "Coleta" | "Entrega"; periodo: string; observacao: string | null; ordem: number;
    situacao: "Pendente" | "EmDeslocamento" | "Concluida" | "NaoRealizada"; motivoNaoRealizacao: string | null;
    dataInicio: string | null; dataConclusao: string | null;
  }>;
}
