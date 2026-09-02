# Configuracao por Aplicacao

Este diretorio cataloga nomes e responsabilidades de configuracao. Valores reais, senhas, tokens e URLs com credenciais nunca sao registrados aqui nem versionados.

- [API e Migrador](01-api-e-migrador.md)
- [Web e BFF](03-web-e-bff.md)
- [Matriz de ambientes](04-ambientes.md)

## Convencoes

- configuracao externa prevalece sobre `appsettings`;
- segredos sao exclusivos por ambiente;
- `DATABASE_PUBLIC_URL` nao deve ser usada;
- producao falha quando configuracoes obrigatorias nao existem;
- flags de desenvolvimento e teste sao proibidas em producao;
- nenhuma documentacao deve mostrar valores resolvidos de conexao ou credenciais.
