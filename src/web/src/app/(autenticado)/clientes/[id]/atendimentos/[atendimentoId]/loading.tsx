import { Skeleton } from "@/components/ui/skeleton";

export default function CarregandoDetalheAtendimento() {
  return <div aria-busy="true" aria-label="Carregando detalhes do atendimento" className="space-y-6"><Skeleton className="h-4 w-72 max-w-full" /><Skeleton className="h-9 w-80 max-w-full" /><div className="space-y-2"><Skeleton className="h-8 w-72 max-w-full" /><Skeleton className="h-4 w-56 max-w-full" /></div><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"><Skeleton className="h-96 w-full" /><Skeleton className="h-72 w-full" /></div></div>;
}
