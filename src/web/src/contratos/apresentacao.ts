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
  situacao: SituacaoAcaoComercial;
  totalDestinatarios: number | null;
  dataAtualizacao: string;
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
