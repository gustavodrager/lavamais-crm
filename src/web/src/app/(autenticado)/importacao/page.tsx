import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { FormularioImportacao } from "./formulario-importacao";

export default function Importacao() {
  return <><CabecalhoPagina titulo="Importação de clientes" descricao="Envie um CSV, revise as linhas e confirme uma carga idempotente por código externo ou WhatsApp." /><FormularioImportacao /></>;
}
