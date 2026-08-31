import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioCliente } from "./formulario-cliente";

export default async function NovoCliente({ searchParams }: { searchParams: Promise<{ retorno?: string }> }) {
  const { retorno } = await searchParams;
  return <><CabecalhoPagina titulo="Novo cliente" descricao="Cadastre contato, autorização de mensagens e endereço para os próximos atendimentos." /><Card className="max-w-3xl"><CardHeader><CardTitle>Dados do cliente</CardTitle></CardHeader><CardContent><FormularioCliente retorno={retorno} /></CardContent></Card></>;
}
