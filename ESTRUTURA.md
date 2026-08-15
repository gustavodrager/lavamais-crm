# Estrutura do Repositorio

## Estrutura atual de planejamento

```text
lavamais-crm/
├── AGENTS.md
├── README.md
├── ESTRUTURA.md
├── docs/
│   ├── 00-visao-geral/
│   ├── 01-descoberta-negocio/
│   ├── 02-produto/
│   ├── 03-prototipo/
│   ├── 04-backlog/
│   ├── 05-regras-negocio/
│   ├── 06-lgpd-seguranca/
│   ├── 07-tecnico/
│   ├── 08-comercial/
│   ├── 09-reunioes/
│   ├── 10-decisoes/
│   ├── 11-implantacao-inicial/
│   └── 99-referencias/
├── prototipo/                  # prototipo historico
└── prototipo_v1/               # prototipo historico
```

## Estrutura prevista para o codigo

```text
lavamais-crm/
├── src/
│   ├── web/                    # Next.js e BFF
│   └── backend/
│       ├── LavaMais.Crm.Api/
│       ├── LavaMais.Crm.Worker/
│       ├── Modulos/
│       │   ├── Clientes/
│       │   ├── Catalogo/
│       │   ├── Segmentacao/
│       │   ├── ModelosDeMensagem/
│       │   ├── AcoesComerciais/
│       │   ├── Importacoes/
│       │   ├── Autorizacao/
│       │   ├── Auditoria/
│       │   └── Integracoes/
│       └── BlocosDeConstrucao/
├── testes/
│   ├── backend/
│   ├── frontend/
│   └── ponta-a-ponta/
├── infraestrutura/
└── docs/
```

A estrutura de codigo sera criada somente quando iniciarmos o scaffold. Alteracoes nessa organizacao exigem registro em ADR.
