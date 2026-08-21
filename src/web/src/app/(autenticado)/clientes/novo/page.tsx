import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormularioCliente } from "./formulario-cliente";

export default function NovoCliente() {
  return <><CabecalhoPagina titulo="Novo cliente" descricao="Cadastre o contato e a permissão de comunicação que serão usados nas Ações Comerciais." /><Card className="max-w-3xl"><CardHeader><CardTitle>Dados do cliente</CardTitle></CardHeader><CardContent><FormularioCliente /></CardContent></Card></>;
}
