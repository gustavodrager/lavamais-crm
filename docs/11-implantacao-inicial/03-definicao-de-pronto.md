# Definicao de Pronto

Uma fatia so esta pronta quando:

- regra e comportamento estao documentados;
- codigo e identificadores seguem o portugues sem acentos;
- contrato HTTP foi atualizado no OpenAPI;
- migration foi criada quando necessario;
- testes unitarios e de integracao passam;
- isolamento por tenant foi verificado;
- autorizacao foi testada na API;
- logs nao expõem dados sensiveis;
- erros possuem resposta consistente;
- interface cobre carregamento, vazio, erro e sucesso;
- fluxo principal relevante possui teste ponta a ponta;
- documentacao da fatia acompanha a implementacao;
- pipeline passa sem segredos versionados.

Para a Versao 1.0 estar pronta, tambem e necessario:

- validar importacao com amostra real autorizada;
- provisionar cliente OIDC e primeiro administrador;
- validar tokens com audiencia `lavamais-crm-api` em homologacao;
- provisionar chave e templates no Notification Hub;
- testar idempotencia em repeticao de requisicao;
- testar falha parcial de destinatarios;
- executar restauracao de backup em ambiente controlado;
- obter validacao operacional do fluxo pela LavaMais.
