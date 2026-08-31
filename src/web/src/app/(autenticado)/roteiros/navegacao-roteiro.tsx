import Link from "next/link";
import { ListChecks, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NavegacaoRoteiro({ modo, data }: { modo: "organizar" | "executar"; data: string }) {
  return <div className="mb-5 inline-flex w-full rounded-lg border bg-secondary/40 p-1 sm:w-auto" role="tablist" aria-label="Modo do roteiro">
    <Button asChild variant={modo === "organizar" ? "default" : "ghost"} className="flex-1 sm:min-w-40" role="tab" aria-selected={modo === "organizar"}>
      <Link href={`/roteiros?data=${data}`}><ListChecks />Organizar</Link>
    </Button>
    <Button asChild variant={modo === "executar" ? "default" : "ghost"} className="flex-1 sm:min-w-40" role="tab" aria-selected={modo === "executar"}>
      <Link href={`/meu-roteiro?data=${data}`}><Navigation />Executar</Link>
    </Button>
  </div>;
}
