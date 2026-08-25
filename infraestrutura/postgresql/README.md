# Scripts PostgreSQL do BFF

Os scripts desta pasta sao aplicados manualmente, em ordem numerica, como etapa controlada da implantacao. O BFF nao altera o schema automaticamente no startup.

| Script | Finalidade |
|---|---|
| `001-sessoes-web.sql` | cria o schema `web` e a tabela de sessoes server-side |
| `002-remover-estados-oidc.sql` | remove a tabela temporaria do fluxo OIDC substituido pelo ADR-011 |

O segundo script remove somente estados temporarios do fluxo desativado. Ele nao altera as sessoes locais vigentes.
