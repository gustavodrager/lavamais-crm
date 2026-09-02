# Modulos e Dependencias

## Modulos iniciais

| Modulo | Responsabilidade |
|---|---|
| `Identidade` | credenciais locais e sessoes opacas |
| `Clientes` | cadastro, contatos, enderecos, etiquetas e permissoes |
| `Catalogo` | produtos e servicos oferecidos |
| `Segmentacao` | criterios, simulacao e elegibilidade |
| `ModelosDeMensagem` | modelos comerciais e versoes publicadas |
| `AcoesComerciais` | fluxo, audiencia, envios e resultados |
| `MovimentacoesComerciais` | historico comercial manual sem controle operacional |
| `Roteiros` | organizacao e execucao manual das coletas e entregas do dia |
| `Importacoes` | entrada de clientes por CSV |
| `Autorizacao` | papeis especificos do CRM |
| `Auditoria` | registro imutavel de eventos sensiveis |
| `Integracoes` | contexto temporario de migration para remover a infraestrutura antiga |

## Relacoes permitidas

```mermaid
flowchart LR
    ID[Identidade] -. autentica .-> AU[Autorizacao]
    I[Importacoes] --> C[Clientes]
    C --> S[Segmentacao]
    G[Catalogo] --> A[AcoesComerciais]
    S --> A
    M[ModelosDeMensagem] --> A
    WEB[Web e BFF] --> A
    WEB -->|wa.me em janela auxiliar| W[WhatsApp oficial]
    AU[Autorizacao] -. protege .-> A
    AU -. protege .-> C
    AD[Auditoria] -. observa eventos .-> A
    AD -. observa eventos .-> C
    C -->|porta de consulta| MV[MovimentacoesComerciais]
    G -->|porta de consulta| MV
    C -->|porta de consulta| R[Roteiros]
    AD -. observa eventos .-> R
```

As setas representam contratos de aplicacao, nao acesso a tabelas ou entidades internas.

## Estrutura interna

Cada modulo possui:

```text
Modulo/
├── Dominio/
├── Aplicacao/
├── Infraestrutura/
└── Api/
```

- `Dominio` nao depende de ASP.NET Core, EF Core ou provedores.
- `Aplicacao` coordena casos de uso e portas.
- `Infraestrutura` implementa persistencia e adaptadores.
- `Api` expoe endpoints e traduz contratos HTTP.

## Persistencia entre modulos

- um `DbContext` por modulo, usando a mesma conexao PostgreSQL;
- schemas separados;
- sem propriedades de navegacao EF entre modulos;
- referencias externas ao modulo sao IDs e snapshots necessarios ao historico;
- integridade entre modulos e validada por contratos de aplicacao;
- transacoes que alteram um unico agregado permanecem no modulo proprietario;
- abertura e confirmacao do WhatsApp sao registradas como auditoria no mesmo fluxo autenticado.

## Extracao futura

Separar um modulo em servico so sera considerado quando houver necessidade concreta de escala, isolamento operacional, ciclo de deploy ou equipe independente. A separacao exige ADR proprio.
