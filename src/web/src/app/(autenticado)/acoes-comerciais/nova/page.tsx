import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { FormularioNovaAcao } from "@/components/formulario-nova-acao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NovaAcao() {
  return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo e pelo item que dará contexto à comunicação." /><div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]"><Card><CardHeader><CardTitle>Informações iniciais</CardTitle></CardHeader><CardContent><FormularioNovaAcao /></CardContent></Card><Card className="h-fit"><CardHeader><CardTitle className="text-base">Etapas da ação</CardTitle></CardHeader><CardContent><ol className="space-y-4 text-sm"><li className="font-medium text-primary">1. Informações iniciais</li><li className="text-muted-foreground">2. Definir público</li><li className="text-muted-foreground">3. Revisar destinatários</li><li className="text-muted-foreground">4. Escolher mensagem</li><li className="text-muted-foreground">5. Preparar e enviar</li></ol></CardContent></Card></div></>;
}
