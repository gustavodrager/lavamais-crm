"use client";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>Não foi possível carregar esta área</AlertTitle><AlertDescription><p>Tente novamente. Se o problema continuar, informe a equipe responsável.</p><Button variant="outline" className="mt-4" onClick={reset}>Tentar novamente</Button></AlertDescription></Alert>; }
