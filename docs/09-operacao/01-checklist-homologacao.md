# Checklist de Homologacao

## Antes do deploy

- [ ] confirmar commit, artefatos e ambiente `Homologacao`;
- [ ] confirmar que nenhuma alteracao local ficou fora do commit;
- [ ] validar pipelines de backend e frontend;
- [ ] revisar migrations novas e scripts PostgreSQL numerados;
- [ ] confirmar backup ou ponto de restauracao anterior quando houver dados;
- [ ] validar variaveis conforme `docs/07-tecnico/configuracao`;
- [ ] confirmar que nao existem variaveis, credenciais ou servico ativo de provedor de WhatsApp;
- [ ] definir a estacao e a conta oficial usadas no ensaio.

## Banco

- [ ] executar o Migrador uma unica vez;
- [ ] aplicar scripts de `infraestrutura/postgresql/` em ordem numerica;
- [ ] registrar commit, horario UTC, ambiente, executor e resultado;
- [ ] confirmar schemas e historicos de migrations esperados;
- [ ] nao carregar dados antes de validar o schema.

## Aplicacoes

- [ ] publicar API e validar `/saude/vivo` e `/saude/pronto`;
- [ ] publicar Web/BFF e validar pagina de entrada;
- [ ] validar os cabecalhos de seguranca do Web/BFF e a ausencia de `X-Powered-By`;
- [ ] validar primeiro acesso ou login existente;
- [ ] reiniciar Web/BFF e confirmar continuidade da sessao;
- [ ] validar isolamento de tenant e papeis;
- [ ] executar fluxo de clientes, importacao, catalogo, modelos e audiencia preparada;
- [ ] registrar, consultar e cancelar uma Movimentacao Comercial conforme o perfil;
- [ ] organizar, publicar e executar um roteiro diario manual;
- [ ] abrir a conversa para destinatario autorizado sem marcar envio automaticamente;
- [ ] validar janela auxiliar, popup bloqueado e QR Code quando a sessao estiver expirada;
- [ ] enviar manualmente e confirmar `Enviado` somente depois do envio real;
- [ ] repetir a confirmacao e validar conflito sem duplicar auditoria de envio;

## Evidencias

- [ ] registrar versoes implantadas e URLs;
- [ ] registrar resultados sem copiar tokens ou dados pessoais;
- [ ] atualizar a matriz de prontidao;
- [ ] abrir pendencias com responsavel e criterio de conclusao.

Antes de usar credenciais, executar a verificacao publica e somente leitura:

```bash
scripts/homologacao/verificar-superficie-publica.sh \
  https://lavamais-crm-api-homologacao.up.railway.app \
  https://lavamais-crm-web-homologacao.up.railway.app
```
