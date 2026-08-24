import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: path.resolve(__dirname, "../../tests/frontend/e2e"),
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  webServer: [
    { command: "node ../../tests/frontend/suporte/crm-api-falsa.mjs", cwd: __dirname, url: "http://127.0.0.1:4310/api/v1/acoes-comerciais", reuseExistingServer: false },
    { command: "npm run dev -- --webpack --hostname 127.0.0.1", cwd: __dirname, url: "http://127.0.0.1:3000", reuseExistingServer: false, env: { ...process.env, LAVAMAIS_AMBIENTE_TESTE: "1", LAVAMAIS_CRM_API_URL: "http://127.0.0.1:4310", LAVAMAIS_ENVIO_NOTIFICACOES_HABILITADO: "1" } },
  ],
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
