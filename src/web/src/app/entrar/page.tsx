import { AlertCircle } from "lucide-react";
import { Marca } from "@/components/marca";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function primeiroAcessoDisponivel() { try { const url = process.env.LAVAMAIS_CRM_API_URL; if (!url) return false; const r = await fetch(new URL("/api/v1/autenticacao/primeiro-acesso", url), { cache: "no-store" }); return r.ok && (await r.json() as { disponivel: boolean }).disponivel; } catch { return false; } }

export default async function Entrar({ searchParams }: { searchParams: Promise<{ erro?: string; retorno?: string }> }) {
  const [{ erro, retorno }, primeiro] = await Promise.all([searchParams, primeiroAcessoDisponivel()]);
  const falha = erro ? mensagemDaFalha(erro) : null;
  return <main className="grid min-h-screen place-items-center bg-muted/30 p-4"><Card className="w-full max-w-md rounded-lg"><CardHeader><Marca /><CardTitle className="pt-6 text-2xl">{primeiro ? "Defina sua senha" : "Acesse o LavaMais CRM"}</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm leading-6 text-muted-foreground">{primeiro ? "Primeiro acesso: defina a senha do seu usuário." : "Entre usando seu telefone e senha."}</p>{falha && <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>{falha.titulo}</AlertTitle><AlertDescription>{falha.descricao}</AlertDescription></Alert>}<form action="/api/autenticacao/entrar" method="post" className="space-y-4"><input type="hidden" name="primeiroAcesso" value={primeiro ? "1" : "0"} />{retorno && <input type="hidden" name="retorno" value={retorno} />}<div className="space-y-2"><Label htmlFor="telefone">Telefone</Label><Input id="telefone" name="telefone" inputMode="tel" autoComplete="username" placeholder="(13) 99999-9999" autoFocus required /></div><div className="space-y-2"><Label htmlFor="senha">Senha</Label><Input id="senha" name="senha" type="password" minLength={10} autoComplete={primeiro ? "new-password" : "current-password"} required />{primeiro && <p className="text-xs text-muted-foreground">Use pelo menos 10 caracteres.</p>}</div><Button type="submit" className="w-full">{primeiro ? "Definir senha e entrar" : "Entrar"}</Button></form></CardContent></Card></main>;
}

function mensagemDaFalha(erro: string) {
  if (erro === "indisponivel") return { titulo: "Serviço temporariamente indisponível", descricao: "Não foi possível conectar ao CRM agora. Tente novamente em alguns instantes." };
  if (erro === "configuracao") return { titulo: "Acesso ainda não configurado", descricao: "O ambiente não está pronto para autenticação. Informe a equipe responsável." };
  if (erro === "tentativas") return { titulo: "Muitas tentativas seguidas", descricao: "Aguarde alguns minutos antes de tentar entrar novamente." };
  return { titulo: "Telefone ou senha incorretos", descricao: "Confira os dados informados e tente novamente." };
}
