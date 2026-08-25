# Migrations e Scripts PostgreSQL

## Responsabilidades

- migrations EF pertencem ao modulo que possui o schema;
- `LavaMais.Crm.Migrador` aplica migrations do backend;
- scripts em `infraestrutura/postgresql/` pertencem ao schema tecnico do BFF;
- API, Worker e Web nao alteram schema no startup;
- apenas um executor aplica mudancas por ambiente.

## Ordem

1. confirmar commit e ambiente;
2. revisar migrations e scripts ainda nao aplicados;
3. confirmar backup ou ponto de restauracao;
4. interromper operacoes incompatíveis, quando necessario;
5. executar o Migrador;
6. aplicar scripts PostgreSQL em ordem numerica;
7. validar schemas, indices e historicos;
8. registrar resultado antes de publicar a aplicacao.

## Registro minimo

- ambiente;
- commit e versao do artefato;
- migration ou script;
- horario UTC de inicio e termino;
- executor responsavel;
- resultado e evidencia sem segredos;
- plano de recuperacao utilizado, se houver falha.

## Regras de seguranca

- migration destrutiva exige plano especifico e ensaio previo;
- nao editar migration ja aplicada para esconder mudanca;
- nao executar comandos contra URL ou banco nao confirmados;
- nao copiar credenciais resolvidas para tickets, logs ou documentacao;
- rollback de aplicacao somente usa versao compativel com o schema atual.
