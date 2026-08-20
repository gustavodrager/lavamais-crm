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
  itemDeCatalogoId: string;
  versaoModeloId: string | null;
  criterios: CriteriosDeSegmentacao;
  situacao: SituacaoAcaoComercial;
  totalDestinatarios: number | null;
  dataAtualizacao: string;
  versao: number;
}

export interface CriteriosDeSegmentacao {
  versaoSchema: 1;
  modo: "Filtros" | "Manual";
  tipoCliente: string | null;
  cidades: string[] | null;
  bairros: string[] | null;
  etiquetaIds: string[] | null;
  cadastradoApartirDe: string | null;
  dataNascimentoDe: string | null;
  dataNascimentoAte: string | null;
  clienteIds: string[] | null;
}

export type MotivoExclusaoPublico =
  | "ClienteInativo"
  | "ContatoInvalido"
  | "SemPermissao"
  | "ContatoDuplicado";

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
    enviados: number;
    entregues: number;
    lidos: number;
    falhos: number;
    convertidos: number;
    valorConvertido: number;
  };
}

export interface ResumoCliente {
  id: string;
  nome: string;
  whatsapp: string;
  localidade: string;
  etiquetas: string[];
  permiteWhatsapp: boolean;
}

export interface OpcaoItemDeCatalogo {
  id: string;
  nome: string;
  tipo: "Produto" | "Servico";
  categoria: string | null;
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
