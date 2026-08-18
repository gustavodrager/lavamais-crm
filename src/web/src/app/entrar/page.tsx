import { AlertCircle } from "lucide-react";
import { Marca } from "@/components/marca";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return <main className="grid min-h-screen place-items-center bg-muted/30 p-4"><Card className="w-full max-w-md"><CardHeader><Marca /><CardTitle className="pt-6 text-2xl">Acesse o LavaMais CRM</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm leading-6 text-muted-foreground">A autenticação e a seleção do tenant são realizadas com segurança pelo Identity Hub.</p>{erro && <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>Não foi possível autenticar</AlertTitle><AlertDescription>Tente novamente ou contate a equipe responsável.</AlertDescription></Alert>}<Button asChild className="w-full"><a href="/api/autenticacao/entrar">Entrar com Identity Hub</a></Button></CardContent></Card></main>;
}
