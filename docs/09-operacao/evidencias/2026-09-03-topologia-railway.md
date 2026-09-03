# Evidencia de topologia Railway — 2026-09-03

Consulta somente leitura realizada pela Railway CLI no projeto `lavamais-crm` (`5263440b-433f-477d-ab43-2696c55e6392`). Nenhum recurso, variavel ou deploy foi alterado.

## Producao

- ambiente `production` (`90b94695-e749-4868-9e9a-e2891a5d0e2f`);
- PostgreSQL online, com volume `postgres-volume-24bG` de 5 GB;
- bucket `Postgres-PITR` presente;
- nenhuma instancia de API, Web/BFF, Migrador ou worker encontrada nesse ambiente;
- PostgreSQL com uma replica, sem cluster de alta disponibilidade;
- PITR marcado pela CLI como habilitado e com bucket conectado, mas a verificacao ao vivo da cobertura e do arquivador ficou inconclusiva porque a chave SSH local nao esta vinculada a uma conta Railway.

## Homologacao

- ambiente `homologacao` (`cde26ae6-2a51-4511-a15a-8bb6d51e1d27`);
- API online em `https://lavamais-crm-api-homologacao.up.railway.app`;
- Web/BFF online em `https://lavamais-crm-web-homologacao.up.railway.app`;
- Migrador concluido;
- worker sem deployment ativo e offline;
- PostgreSQL online, com volume `postgres-volume-24bG` de 5 GB;
- bucket `durable-module-NfM6` presente;
- PostgreSQL com uma replica, sem cluster de alta disponibilidade;
- PITR marcado pela CLI como habilitado e com bucket conectado, com a mesma limitacao de verificacao ao vivo descrita acima.

## Conclusoes e pendencias

- A topologia visivel esta confirmada nesta data; IDs e estados podem mudar e devem ser reconferidos na janela de implantacao.
- A presenca do bucket e o estado `enabled` nao comprovam janela recuperavel, retencao, ultimo ponto consistente nem tempo de restauracao.
- O worker corresponde ao servico obsoleto documentado. Nao foi ativado nem removido; remocao exige aprovacao explicita.
- Uma consulta de configuracao retornou uma credencial resolvida em texto claro. O valor nao foi copiado para esta evidencia, mas a credencial deve ser rotacionada antes do go-live e os consumidores devem ser reiniciados de forma controlada.
- Permanecem obrigatorios: confirmar cobertura do PITR com conta Railway autorizada, fazer restauracao remota isolada e cronometrada, aprovar RPO/RTO e validar alertas.
