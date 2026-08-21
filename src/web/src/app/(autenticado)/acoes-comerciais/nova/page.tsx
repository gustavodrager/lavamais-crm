import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { FormularioNovaAcao } from "@/components/formulario-nova-acao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";
import { ErroCrmApi } from "@/infraestrutura/crm-api-http";
import { obterPortaCrmApi } from "@/infraestrutura/obter-porta-crm-api";

export default async function NovaAcao() {
  let itensCatalogo;
  try {
    itensCatalogo = await obterPortaCrmApi().listarItensDeCatalogoAtivos();
  } catch (erro) {
    if (erro instanceof ErroCrmApi) {
      return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo e pelo item que dará contexto à comunicação." /><EstadoFalhaApi status={erro.status} /></>;
    }
    throw erro;
  }

  return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo e pelo item que dará contexto à comunicação." />{itensCatalogo.length === 0 ? <EstadoVazio icone={PackageOpen} titulo="Nenhum item ativo no catálogo" descricao="Cadastre ou ative um produto ou serviço antes de criar uma Ação Comercial." /> : <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]"><Card><CardHeader><CardTitle>Informações iniciais</CardTitle></CardHeader><CardContent><FormularioNovaAcao itensCatalogo={itensCatalogo} /></CardContent></Card><Card className="h-fit"><CardHeader><CardTitle className="text-base">Etapas da ação</CardTitle></CardHeader><CardContent><ol className="space-y-4 text-sm"><li className="font-medium text-primary">1. Informações iniciais</li><li className="text-muted-foreground">2. Definir público</li><li className="text-muted-foreground">3. Revisar destinatários</li><li className="text-muted-foreground">4. Escolher mensagem</li><li className="text-muted-foreground">5. Preparar e enviar</li></ol></CardContent></Card></div>}</>;
}
