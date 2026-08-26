import type { ResumoAcaoComercial, SituacaoAcaoComercial } from "../../../src/web/src/contratos/apresentacao";
import { rotuloProximaAcao, selecionarAcaoPrioritaria } from "../../../src/web/src/lib/acoes-comerciais";

const criterios = { versaoSchema: 2 as const, modo: "Filtros" as const, tipoCliente: null, cidades: null, bairros: null, etiquetaIds: null, cadastradoApartirDe: null, dataNascimentoDe: null, dataNascimentoAte: null, clienteIds: null, clienteIdsExcluidos: null };

function criarAcao(id: string, situacao: SituacaoAcaoComercial, dataAtualizacao: string): ResumoAcaoComercial {
  return { id, nome: `Ação ${id}`, objetivo: null, itemDeCatalogoId: null, versaoModeloId: null, criterios, situacao, totalDestinatarios: 1, dataAtualizacao, versao: 1 };
}

describe("prioridade das ações comerciais", () => {
  it("prioriza uma ação com falhas mesmo quando existe rascunho mais recente", () => {
    const rascunho = criarAcao("rascunho", "Rascunho", "2026-08-26T12:00:00Z");
    const comFalhas = criarAcao("falhas", "ConcluidaComFalhas", "2026-08-20T12:00:00Z");

    expect(selecionarAcaoPrioritaria([rascunho, comFalhas])).toEqual(comFalhas);
  });

  it("usa a atualização mais recente quando não existem falhas", () => {
    const antiga = criarAcao("antiga", "Preparada", "2026-08-20T12:00:00Z");
    const recente = criarAcao("recente", "EmProcessamento", "2026-08-26T12:00:00Z");

    expect(selecionarAcaoPrioritaria([antiga, recente])).toEqual(recente);
  });

  it("descreve o próximo comando conforme a situação", () => {
    expect(rotuloProximaAcao("Rascunho")).toBe("Continuar configuração");
    expect(rotuloProximaAcao("Preparada")).toBe("Enviar mensagens");
    expect(rotuloProximaAcao("ConcluidaComFalhas")).toBe("Conferir falhas");
  });
});
