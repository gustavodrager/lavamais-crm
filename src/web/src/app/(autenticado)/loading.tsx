import { Skeleton } from "@/components/ui/skeleton";
export default function Carregando() { return <div aria-busy="true" aria-label="Carregando conteudo" className="space-y-6"><div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-full max-w-xl" /></div><Skeleton className="h-80 w-full" /></div>; }
