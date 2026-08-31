import { modelosPadraoLavaMais } from "../../../src/web/src/conteudo/modelos-padrao-lavamais";
import { ErroCrmApi } from "../../../src/web/src/infraestrutura/crm-api-http";

const dependencias = vi.hoisted(() => ({
  criarEPublicarModelo: vi.fn(),
  obterSessao: vi.fn(),
}));

vi.mock("@/infraestrutura/obter-porta-crm-api", () => ({
  obterPortaCrmApi: () => ({ criarEPublicarModelo: dependencias.criarEPublicarModelo }),
}));

vi.mock("@/infraestrutura/obter-porta-sessao", () => ({
  obterPortaSessao: () => ({ obterSessao: dependencias.obterSessao }),
}));

import { aprovarEDisponibilizarMensagem } from "../../../src/web/src/app/(autenticado)/acoes-comerciais/acoes-mensagens";

describe("aprovação de mensagens em Ações Comerciais", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dependencias.criarEPublicarModelo.mockRejectedValue(new ErroCrmApi(503, "API indisponível no teste"));
  });

  it.each(["Administrador", "Gerente"] as const)("permite solicitar a publicação com o perfil %s", async (papel) => {
    const modelo = modelosPadraoLavaMais[0];
    dependencias.obterSessao.mockResolvedValue({ papel });

    const resultado = await aprovarEDisponibilizarMensagem({
      modeloPadraoId: modelo.id,
      nome: modelo.nome,
      conteudoPreVisualizacao: modelo.conteudoPreVisualizacao,
    });

    expect(resultado).toEqual({ sucesso: false, mensagem: "Não foi possível disponibilizar a mensagem agora." });
    expect(dependencias.criarEPublicarModelo).toHaveBeenCalledWith({
      nome: modelo.nome,
      conteudoPreVisualizacao: modelo.conteudoPreVisualizacao,
      chaveTemplateNotificacao: modelo.chaveTemplateNotificacao,
    });
  });

  it("mantém o Operador sem permissão para publicar", async () => {
    const modelo = modelosPadraoLavaMais[0];
    dependencias.obterSessao.mockResolvedValue({ papel: "Operador" });

    const resultado = await aprovarEDisponibilizarMensagem({
      modeloPadraoId: modelo.id,
      nome: modelo.nome,
      conteudoPreVisualizacao: modelo.conteudoPreVisualizacao,
    });

    expect(resultado).toEqual({
      sucesso: false,
      mensagem: "Somente administradores e gerentes podem aprovar e disponibilizar mensagens.",
    });
    expect(dependencias.criarEPublicarModelo).not.toHaveBeenCalled();
  });
});
