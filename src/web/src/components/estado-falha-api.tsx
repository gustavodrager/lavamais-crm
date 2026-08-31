import { AlertCircle, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function EstadoFalhaApi({ status }: { status: number }) {
  const autenticacao = status === 401; const proibido = status === 403;
  return <Alert variant="destructive">{proibido ? <LockKeyhole aria-hidden="true" /> : <AlertCircle aria-hidden="true" />}<AlertTitle>{autenticacao ? "Sua sessão expirou" : proibido ? "Área restrita" : "Serviço temporariamente indisponível"}</AlertTitle><AlertDescription><p>{autenticacao ? "Entre novamente para continuar." : proibido ? "Seu perfil não possui permissão para acessar esta área." : "Não foi possível consultar os dados agora. Tente novamente em alguns instantes."}</p>{autenticacao && <Button asChild variant="outline" className="mt-4"><a href="/entrar">Entrar novamente</a></Button>}</AlertDescription></Alert>;
}
