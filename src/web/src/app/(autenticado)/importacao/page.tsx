import { redirect } from "next/navigation";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { obterPortaSessao } from "@/infraestrutura/obter-porta-sessao";
import { papelDaVisao } from "@/lib/sessao-apresentacao";
import { FormularioImportacao } from "./formulario-importacao";

export default async function Importacao() {
  const sessao = await obterPortaSessao().obterSessao();
  if (papelDaVisao(sessao) !== "Administrador") redirect("/inicio");
  return <><CabecalhoPagina titulo="Importação de clientes" descricao="Envie um CSV, revise as linhas e confirme uma carga idempotente por código externo ou WhatsApp." /><FormularioImportacao /></>;
}
