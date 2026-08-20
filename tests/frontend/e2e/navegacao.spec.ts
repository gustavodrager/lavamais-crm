import { expect, test } from "../../../src/web/node_modules/@playwright/test";

test.beforeEach(async ({ context, page }) => {
  await context.addCookies([{ name: "lavamais-sessao-teste", value: "sessao-controlada-e2e", url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/acoes-comerciais");
});

test("lista e abre uma Ação Comercial obtida da CRM API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Ações Comerciais" })).toBeVisible();
  await page.getByRole("link", { name: "Ação integrada de edredons" }).click();
  await expect(page.getByRole("heading", { name: "Ação integrada de edredons" })).toBeVisible();
  await expect(page.getByText("10 / 8")).toBeVisible();
});

test("cria, simula e prepara uma ação com modelo publicado", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O fluxo funcional completo é coberto uma vez no desktop");
  await page.getByRole("link", { name: "Nova ação" }).click();
  await page.getByLabel("Nome da ação").fill("Ação criada pelo frontend");
  await page.getByLabel("Objetivo").fill("Validar a criação integrada do rascunho");
  await page.getByRole("combobox", { name: "Item do catálogo" }).click();
  await page.getByRole("option", { name: "Lavagem de edredom · Casa" }).click();
  await page.getByRole("button", { name: "Criar e continuar" }).click();
  await expect(page).toHaveURL(/\/acoes-comerciais\/7e4e1e75-b222-4cff-8db8-222222222222$/);
  await expect(page.getByRole("heading", { name: "Ação criada pelo frontend" })).toBeVisible();
  await page.getByLabel("Cidades").fill("Praia Grande");
  await page.getByRole("button", { name: "Salvar filtros e simular público" }).click();
  await expect(page.getByText("1 elegíveis")).toBeVisible();
  await page.getByRole("combobox", { name: "Modelo de mensagem" }).click();
  await page.getByRole("option", { name: "Oferta de serviço · versão 1" }).click();
  await expect(page.getByText("Olá, {{nomeCliente}}! Conheça {{itemCatalogo}}.")).toBeVisible();
  await page.getByRole("button", { name: "Preparar Ação Comercial" }).click();
  await expect(page.getByText("Preparada", { exact: true })).toBeVisible();
  await expect(page.getByText("Ana Martins")).toBeVisible();
  await page.getByRole("button", { name: "Iniciar processamento" }).click();
  await expect(page.getByText("Em processamento", { exact: true })).toBeVisible();
});

test("oferece acesso às demais areas pelo menu principal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "O menu compacto possui fluxo dedicado");
  await page.goto("/acoes-comerciais");
  await page.getByRole("link", { name: "Clientes" }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
  await page.getByRole("link", { name: "Importação" }).click();
  await expect(page.getByRole("heading", { name: "Importação de clientes" })).toBeVisible();
  await page.getByRole("link", { name: "Configurações" }).click();
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible();
});

test("abre a navegacao em tela pequena", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fluxo especifico da navegacao compacta");
  await page.goto("/clientes");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
});
