# Curto Prazo

## Em desenvolvimento

- concluir `MovimentacoesComerciais` manuais conforme ADR-012, incluindo migration, testes, contrato HTTP, interface e documentacao;
- validar que a nova capacidade continua informativa e nao assume responsabilidades de caixa, producao, estoque, entrega ou fiscal.

## Implantacao inicial

- validar clientes, catalogo, etiquetas e modelos com a operacao;
- realizar carga autorizada em homologacao;
- validar primeiro acesso e continuidade das sessoes depois de reinicios;
- concluir dominio, DNS, alertas e responsaveis operacionais;
- ensaiar restauracao no provedor e definir RPO e RTO;
- integrar um Notification Hub compativel antes de ativar o Worker e o envio individual.

## Qualidade e governanca

- manter a matriz de prontidao atualizada por capacidade;
- registrar contratos e variaveis novas junto da implementacao;
- impedir dados pessoais em logs, fixtures e arquivos versionados;
- validar cada nova migration em banco PostgreSQL real.
