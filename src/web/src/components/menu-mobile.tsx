"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Marca } from "@/components/marca";
import { Navegacao } from "@/components/navegacao";

export function MenuMobile() {
  const [aberto, setAberto] = useState(false);
  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild><Button variant="ghost" size="icon" className="size-11 md:hidden" aria-label="Abrir menu"><Menu /></Button></SheetTrigger>
      <SheetContent side="left" className="w-72 p-5">
        <SheetHeader className="sr-only"><SheetTitle>Menu principal</SheetTitle><SheetDescription>Navegue pelas áreas do CRM.</SheetDescription></SheetHeader>
        <Marca />
        <div className="mt-8"><Navegacao aoNavegar={() => setAberto(false)} /></div>
      </SheetContent>
    </Sheet>
  );
}
