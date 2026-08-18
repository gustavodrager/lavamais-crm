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
