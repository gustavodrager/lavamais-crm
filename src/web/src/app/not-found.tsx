import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NaoEncontrado() { return <main className="grid min-h-screen place-items-center p-6"><div className="text-center"><SearchX className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-2xl font-semibold">Pagina nao encontrada</h1><p className="mt-2 text-sm text-muted-foreground">O endereco pode ter mudado ou nao estar disponivel.</p><Button asChild className="mt-6"><Link href="/acoes-comerciais">Voltar para Acoes Comerciais</Link></Button></div></main>; }
