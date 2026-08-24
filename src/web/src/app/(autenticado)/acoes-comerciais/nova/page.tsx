import { CabecalhoPagina } from "@/components/cabecalho-pagina";
import { EstadoFalhaApi } from "@/components/estado-falha-api";
import { EstadoVazio } from "@/components/estado-vazio";
import { FormularioNovaAcao } from "@/components/formulario-nova-acao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageOpen } from "lucide-react";
import Link from "next/link";
import { JornadaAcao } from "@/components/jornada-acao";
import { Button } from "@/components/ui/button";
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

  return <><CabecalhoPagina titulo="Nova Ação Comercial" descricao="Comece pelo objetivo e pelo serviço que dará contexto à comunicação." /><JornadaAcao etapaAtual={1} />{itensCatalogo.length === 0 ? <EstadoVazio icone={PackageOpen} titulo="Nenhum item ativo no catálogo" descricao="Cadastre ou ative um produto ou serviço antes de criar uma Ação Comercial." acao={<Button asChild><Link href="/configuracoes">Cadastrar produto ou serviço</Link></Button>} /> : <Card className="mx-auto max-w-3xl"><CardHeader><CardTitle>Informações iniciais</CardTitle></CardHeader><CardContent><FormularioNovaAcao itensCatalogo={itensCatalogo} /></CardContent></Card>}</>;
}
