import type { ReactNode } from "react";
import { LayoutAutenticado } from "@/components/layout-autenticado";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: { children: ReactNode }) {
  return <LayoutAutenticado>{children}</LayoutAutenticado>;
}
