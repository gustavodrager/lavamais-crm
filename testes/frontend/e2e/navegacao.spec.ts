import { expect, test } from "../../../src/web/node_modules/@playwright/test";

test.beforeEach(async ({ context, page, request }) => {
  await request.post("http://127.0.0.1:4310/__test/reset", {
    headers: { authorization: "Bearer token-controlado-e2e" },
  });
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais");
});

test("lista e abre uma Ação Comercial obtida da CRM API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Ações Comerciais" })).toBeVisible();
  await page.getByRole("link", { name: "Ação integrada de edredons" }).click();
  await expect(page).toHaveURL(/\/acoes-comerciais\/6d3d0d64-a111-4cff-8db8-111111111111$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Ação integrada de edredons" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("progressbar", { name: "Envios confirmados: 100%" })).toBeVisible();
  await expect(page.getByText("R$ 150,00")).toBeVisible();
});

test("cria, simula e prepara uma ação com modelo publicado", async ({ page }) => {
  await page.goto("/acoes-comerciais/nova");
  await expect(page.getByLabel("Nome da ação")).toBeVisible();
  await page.getByLabel("Nome da ação").fill("Ação criada pelo frontend");
  await page.getByLabel("Objetivo").fill("Validar a criação integrada do rascunho");
  await page.getByRole("combobox", { name: "Item do catálogo" }).click();
  await page.getByRole("option", { name: "Lavagem de edredom · Casa" }).click();
  await page.getByRole("button", { name: "Criar e escolher clientes" }).click();
  await expect(page).toHaveURL(/\/acoes-comerciais\/7e4e1e75-b222-4cff-8db8-222222222222$/);
  await expect(page.getByRole("heading", { name: "Ação criada pelo frontend" })).toBeVisible();
  await page.getByRole("button", { name: /Trazer 10 clientes/ }).click();
  await expect(page.getByText("Sua lista está pronta")).toBeVisible();
  await page.getByRole("button", { name: "Escolher a mensagem" }).click();
  await page.getByRole("radio", { name: /Oferta de serviço/ }).click();
  await expect(page.getByText("Olá, Ana Martins! Conheça Lavagem de edredom.")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar clientes e mensagem" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Esta ação ficará pronta com 1 cliente");
  await page.getByRole("button", { name: "Sim, começar os atendimentos" }).click();
  await expect(page.getByText("Preparada", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Ana Martins/ }).click();
  await expect(page.getByText("Olá, Ana Martins!")).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(window, "open", {
      configurable: true,
      value: () => ({ opener: null, location: { href: "" }, focus() {} }),
    });
  });
  await page.getByRole("button", { name: "Abrir WhatsApp para Ana Martins" }).click();
  await expect(page.getByText("Conversa aberta", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirmar que enviei" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("O CRM não consegue verificar o clique no WhatsApp");
  await page.getByRole("button", { name: "Sim, eu enviei" }).click();
  await expect(page.getByText("Concluída", { exact: true })).toBeVisible();
  await expect(page.getByText("Envio confirmado", { exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Envios confirmados: 100%" })).toBeVisible();
});

test("oferece ao gerente as areas permitidas pelo menu principal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O menu compacto possui fluxo dedicado");
  await page.goto("/acoes-comerciais");
  await page.getByRole("link", { name: "Clientes" }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
  await page.getByRole("link", { name: "Configurações" }).click();
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "WhatsApp Web assistido" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Catálogo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Etiquetas" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveCount(0);
});

test("reserva a importação de clientes ao administrador", async ({ context, page }, testInfo) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-admin-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/importacao");
  await expect(page.getByRole("heading", { name: "Importação de clientes" })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Mais" }).click();
  }
  const navegacaoPrincipal = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(navegacaoPrincipal.getByRole("link", { name: "Importação" })).toHaveAttribute("aria-current", "page");
});

test("oferece ao gerente a mesma gestão de mensagens do administrador", async ({ page }) => {
  await page.goto("/acoes-comerciais?visao=mensagens");
  await expect(page.getByRole("heading", { name: "Ações Comerciais" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { name: "Mensagens aprovadas" })).toBeVisible();
  await expect(page.getByText("Oferta de serviço")).toBeVisible();
  await expect(page.getByText("WhatsApp · versão 1")).toBeVisible();
  await page.getByRole("button", { name: "Nova mensagem" }).click();
  await expect(page.getByRole("heading", { name: "Aprovar nova mensagem" })).toBeVisible();
  await page.getByRole("button", { name: /Coleta e entrega LavaMais/ }).click();
  await expect(page.getByLabel("Nome da mensagem")).toHaveValue("Coleta e entrega LavaMais");
  await expect(page.getByLabel("Texto aprovado")).toHaveValue(/{{nomeCliente}}/);
});

test("permite ao administrador iniciar a aprovação de uma mensagem", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-admin-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais?visao=mensagens");
  await page.getByRole("button", { name: "Nova mensagem" }).click();
  await expect(page.getByRole("heading", { name: "Aprovar nova mensagem" })).toBeVisible();
  await page.getByRole("button", { name: /Coleta e entrega LavaMais/ }).click();
  await expect(page.getByLabel("Nome da mensagem")).toHaveValue("Coleta e entrega LavaMais");
  await expect(page.getByLabel("Texto aprovado")).toHaveValue(/{{nomeCliente}}/);
  await expect(page.getByLabel(/Chave técnica/)).toHaveCount(0);
});

test("resume pendências e resultados relevantes no painel gerencial", async ({ page }) => {
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Olá! O que precisa ser feito agora?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retornos para registrar: 4" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Resultados registrados: 8" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Valor convertido informado: R$ 150,00" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operação de hoje" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Roteiro de hoje" })).toBeVisible();
  await expect(page.getByText("Motorista: Carlos")).toBeVisible();
  await expect(page.getByText("1 registro", { exact: true })).toBeVisible();
  await expect(page.getByText("1 registro cancelado", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Amanhã: Em preparação · 2 paradas" })).toBeVisible();
});

test("mostra o painel operacional para a recepção", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/inicio");
  await expect(page.getByRole("heading", { name: "Operação de hoje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Registrar atendimento" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Atendimentos recentes" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar cliente" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cadastrar cliente" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Executar roteiro" }).first()).toBeVisible();
  await expect(page.getByText("Atendimentos hoje")).toBeVisible();
  await expect(page.getByText("1 registro cancelado hoje", { exact: true })).toBeVisible();
});

test("operador visualiza telefone e detalhes dos clientes", async ({ context, page }, testInfo) => {
  const telefone = "+55 (13) 99999-9999";
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/clientes");
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  if (testInfo.project.name === "desktop") {
    const linhaCliente = page.getByRole("row").filter({ hasText: "Ana Martins" });
    await expect(linhaCliente.getByRole("cell", { name: telefone })).toBeVisible();
    await linhaCliente.getByRole("link", { name: /Ana Martins/ }).click();
  } else {
    const cartaoCliente = page.getByRole("link", { name: /Ana Martins/ }).first();
    await expect(cartaoCliente.getByText(telefone)).toBeVisible();
    await cartaoCliente.click();
  }
  await expect(page.getByRole("heading", { name: "Ana Martins" })).toBeVisible();
  const contato = page.getByRole("region", { name: "Contato" });
  await expect(contato.getByRole("link", { name: telefone })).toBeVisible();
  await expect(contato.getByRole("link", { name: "ana@example.com" })).toBeVisible();
  await expect(contato.getByText("Autorizado", { exact: true })).toBeVisible();

  const endereco = page.getByRole("region", { name: "Endereço completo" });
  await expect(endereco.getByText("Av. Presidente Kennedy", { exact: true })).toBeVisible();
  await expect(endereco.getByText("1240", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Apto 42", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Boqueirão", { exact: true })).toBeVisible();
  await expect(endereco.getByText("Praia Grande", { exact: true })).toBeVisible();
  await expect(endereco.getByText("SP", { exact: true })).toBeVisible();
  await expect(endereco.getByText("11700-000", { exact: true })).toBeVisible();

  await page.getByText("Informações complementares", { exact: true }).click();
  const cadastro = page.getByRole("region", { name: "Cadastro" });
  await expect(cadastro.getByText("Ana Casa", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("Residencial", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("12/05/1988", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("1001", { exact: true })).toBeVisible();
  await expect(cadastro.getByText("Criado no CRM", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Etiquetas" }).getByText("Cliente recorrente")).toBeVisible();
});

test("mostra ações comerciais como fila para o operador", async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais?visao=mensagens");
  await expect(page).toHaveURL(/\/acoes-comerciais$/);
  await expect(page.getByRole("heading", { name: "Fila de mensagens" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mensagens aprovadas" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Nova ação comercial" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Para enviar" })).toBeVisible();
  await page.goto("/acoes-comerciais?filtro=Retornos");
  await expect(page.getByRole("button", { name: "Retornos" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: /Abrir fila: Ação integrada de edredons/ }).click();
  await expect(page.getByText("Fila de atendimento")).toBeVisible();
  await expect(page.getByText("Olá, Cliente 1!")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Resultado de Cliente 1" })).toBeVisible();
});

test("administrador alterna a visualizacao para conferir a experiencia do operador", async ({ context, page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O seletor de visão fica no topo desktop");
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-admin-operador-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/inicio");
  await expect(page.getByRole("combobox", { name: "Alterar visão do perfil" })).toBeVisible();
  await expect(page.getByText("Vendo como Operador")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operação de hoje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Importação" })).toHaveCount(0);
});

test("registra um atendimento comercial e exibe a confirmação", async ({ page }) => {
  await page.goto("/movimentacoes?busca=Ana&clienteId=6d3d0d64-a111-4cff-8db8-111111111113");
  await expect(page.getByRole("heading", { name: "Atendimentos" })).toBeVisible();
  await expect(page.getByText("Montar atendimento", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Selecionar Edredom, Lavagem/ }).click();
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Revisar atendimento" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("R$ 150,00");
  await page.getByRole("button", { name: "Confirmar atendimento" }).click();
  await expect(page.getByText("Atendimento registrado", { exact: true })).toBeVisible();
  await expect(page.getByText("Ana Martins · R$ 150,00", { exact: true })).toBeVisible();
});

test("abre os detalhes de um atendimento pelo historico do cliente", async ({ page }, testInfo) => {
  const atendimentoId = "7d3d0d64-a111-4cff-8db8-111111111111";
  const clienteId = "6d3d0d64-a111-4cff-8db8-111111111113";
  await page.goto(`/clientes/${clienteId}`);
  await page.locator(`a[href="/clientes/${clienteId}/atendimentos/${atendimentoId}"]:visible`).first().click();
  await expect(page).toHaveURL(`/clientes/${clienteId}/atendimentos/${atendimentoId}`);
  await expect(page.getByRole("heading", { name: "Detalhes do atendimento" })).toBeVisible();
  await expect(page.getByText("Itens e serviços", { exact: true })).toBeVisible();
  if (testInfo.project.name === "desktop") {
    await expect(page.getByRole("cell", { name: "Edredom", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "R$ 75,00", exact: true }).first()).toBeVisible();
  } else {
    await expect(page.getByText("Edredom", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("R$ 75,00", { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("Registro comercial informativo")).toBeVisible();
});

test("apresenta o roteiro manual em modo de execução", async ({ page }) => {
  await page.goto("/meu-roteiro");
  await expect(page.getByRole("heading", { name: "Roteiro em execução" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Maria Helena Costa" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Progresso do roteiro: 33%" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir no mapa" })).toBeVisible();
  await expect(page.getByRole("link", { name: "WhatsApp" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sequência do dia" })).toBeVisible();
});

test("redireciona visitantes sem sessão para a entrada", async ({ context, page }) => {
  await context.clearCookies();
  await page.goto("/clientes");
  await expect(page).toHaveURL(/\/entrar$/);
  await expect(page.getByRole("heading", { name: "Acesse o LavaMais CRM" })).toBeVisible();
});

test("protege as respostas publicas do BFF", async ({ request }) => {
  const resposta = await request.get("/entrar");
  const cabecalhos = resposta.headers();

  expect(resposta.ok()).toBeTruthy();
  expect(cabecalhos["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(cabecalhos["cross-origin-opener-policy"]).toBe("same-origin");
  expect(cabecalhos["permissions-policy"]).toBe("camera=(), geolocation=(), microphone=()");
  expect(cabecalhos["referrer-policy"]).toBe("no-referrer");
  expect(cabecalhos["x-content-type-options"]).toBe("nosniff");
  expect(cabecalhos["x-frame-options"]).toBe("DENY");
  expect(cabecalhos["x-powered-by"]).toBeUndefined();
});

test("abre a navegacao em tela pequena", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fluxo especifico da navegacao compacta");
  await page.goto("/clientes");
  await expect(page.getByRole("navigation", { name: "Navegação rápida" })).toBeVisible();
  await page.getByRole("button", { name: "Mais" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
});
