import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { EstadoVazio } from "@/components/estado-vazio";
import { Button } from "@/components/ui/button";

export default function AtendimentoNaoEncontrado() {
  return <EstadoVazio icone={ReceiptText} titulo="Atendimento não encontrado" descricao="O atendimento não existe, não pertence a este cliente ou não está disponível para a sua unidade." acao={<Button asChild><Link href="/clientes">Voltar para clientes</Link></Button>} />;
}
