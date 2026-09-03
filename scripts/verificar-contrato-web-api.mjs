import { readFile } from "node:fs/promises";

const [urlOpenApi, arquivoContrato = "contratos/web-api.json"] = process.argv.slice(2);
if (!urlOpenApi) throw new Error("Uso: node scripts/verificar-contrato-web-api.mjs <url-openapi> [contrato.json]");

const contrato = JSON.parse(await readFile(arquivoContrato, "utf8"));
const resposta = await fetch(urlOpenApi);
if (!resposta.ok) throw new Error(`OpenAPI indisponivel: HTTP ${resposta.status}`);
const documento = await resposta.json();
const ausentes = contrato.filter(([metodo, caminho]) => !documento.paths?.[caminho]?.[metodo.toLowerCase()]);
if (ausentes.length) {
  console.error("Operacoes exigidas pelo Web/BFF ausentes no OpenAPI:");
  for (const [metodo, caminho] of ausentes) console.error(`- ${metodo} ${caminho}`);
  process.exit(1);
}
console.log(`${contrato.length} operacoes Web/API confirmadas no OpenAPI.`);
