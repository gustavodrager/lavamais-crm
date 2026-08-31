import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function NaoEncontrado() { return <main className="grid min-h-screen place-items-center p-6"><div className="text-center"><SearchX className="mx-auto size-10 text-primary" aria-hidden="true" /><h1 className="mt-4 text-2xl font-semibold">Página não encontrada</h1><p className="mt-2 text-sm text-muted-foreground">O endereço pode ter mudado ou não estar disponível.</p><Button asChild className="mt-6"><Link href="/inicio">Voltar ao início</Link></Button></div></main>; }
