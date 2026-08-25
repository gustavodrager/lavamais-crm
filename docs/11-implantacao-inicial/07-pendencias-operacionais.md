# Pendencias Operacionais e de Dados

## Dados iniciais

- converter planilhas autorizadas para o CSV canonico;
- revisar pre-visualizacao antes da confirmacao em homologacao;
- validar atualizacao idempotente por `codigoExterno` ou WhatsApp;
- definir retencao de arquivos e linhas de importacao;
- definir anonimizacao e exclusao conforme orientacao juridica;
- proteger e revisar os arquivos locais em `outputs/`.

## Infraestrutura

- substituir dominios temporarios por dominios definitivos e configurar DNS;
- confirmar cobertura inicial do PITR;
- executar restauracao isolada no provedor;
- definir RPO, RTO e retencao;
- configurar alertas, escalonamento e responsaveis;
- registrar aplicacao de migrations e scripts por ambiente.

## Essence GO Industrial

- acessar o sistema somente quando autorizado;
- inventariar exportacoes, formatos e eventual API oficial;
- validar como `codigoExterno` participa da conciliacao;
- nao usar scraping, endpoints privados ou banco compartilhado como integracao permanente.

## Operacao assistida

- treinar Gerente e Operador;
- definir responsavel pelo primeiro acesso e recuperacao controlada;
- definir janela e suporte da primeira carga;
- registrar evidencias da homologacao sem dados pessoais desnecessarios.
