# Modulo de Catalogo

Mantem produtos e servicos comerciais por tenant. O nome e unico dentro do tenant, o valor de referencia e opcional e nao representa estoque, preco transacional ou financeiro.

Itens podem ser inativados para impedir seu uso em novas acoes comerciais sem apagar o historico.

Referencias agregadas vindas de relatorios sem composicao por ticket sao registradas como itens genericos inativos e claramente prefixados. A oferta tecnica usada por movimentacoes historicas sem itens tambem permanece inativa e nao aparece entre as ofertas operacionais.

Conforme ADR-019, homologacao pode criar artigos e ofertas inativos com prefixo `HML sintetico` para exercitar movimentacoes com varias linhas. Esses registros nao representam o catalogo real do Essence, nao ficam disponiveis para novas movimentacoes e podem ser removidos da composicao pela operacao de reversao do importador.
