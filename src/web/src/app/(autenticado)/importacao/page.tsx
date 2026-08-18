import { FileSpreadsheet, Upload } from "lucide-react";
import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Importacao() {
  return <><CabecalhoPagina titulo="Importação de clientes" descricao="Envie um CSV, confira o mapeamento e revise linhas inválidas antes de confirmar qualquer gravação." /><Card><CardContent className="flex min-h-80 flex-col items-center justify-center border-2 border-dashed border-primary/20 p-8 text-center"><span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><FileSpreadsheet className="size-6" aria-hidden="true" /></span><h2 className="mt-5 font-semibold">Comece com um arquivo CSV</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">A pré-visualização permitirá mapear colunas e corrigir problemas antes da importação.</p><Button className="mt-5"><Upload aria-hidden="true" />Selecionar arquivo CSV</Button><p className="mt-3 text-xs text-muted-foreground">Nenhum arquivo será enviado nesta demonstração.</p></CardContent></Card></>;
}
