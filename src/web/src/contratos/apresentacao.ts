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
    aguardandoSolicitacao: number;
    solicitados: number;
    enviados: number;
    entregues: number;
    lidos: number;
    falhos: number;
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

export type SituacaoEnvio = "Pendente" | "AguardandoSolicitacao" | "Solicitado" | "Enviado" | "Entregue" | "Lido" | "Falhou";
export type ResultadoComercial = "NaoInformado" | "SemRetorno" | "Respondeu" | "Interessado" | "Convertido" | "NaoTemInteresse";
export interface DestinatarioDaAcao {
  id: string;
  clienteId: string;
  nomeCliente: string;
  destino: string;
  conteudoPreVisualizacao: string;
  situacaoEnvio: SituacaoEnvio;
  resultadoComercial: ResultadoComercial;
  valorConvertido: number | null;
  dataResultadoComercial: string | null;
  codigoFalha: string | null;
  versao: number;
}

export interface ResumoCliente {
  id: string;
  nome: string;
  whatsapp: string;
  localidade: string;
  quantidadeEtiquetas: number;
  permiteWhatsapp: boolean;
  codigoExterno: string | null;
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
  autenticacaoDesabilitada?: boolean;
}

export interface ResultadoPaginado<T> {
  itens: T[];
  pagina: number;
  tamanhoPagina: number;
  total: number;
}
