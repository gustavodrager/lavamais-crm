# Modulo de Modelos de Mensagem

Mantem modelos comerciais de WhatsApp e suas versoes publicadas e imutaveis. A publicacao aceita somente as variaveis controladas `nomeCliente` e `itemCatalogo`.

`Administrador` e `Gerente` podem criar e publicar modelos. O `Operador` pode usar somente a mensagem ja preparada em uma acao comercial.

`chaveTemplateNotificacao` e a chave tecnica estavel do modelo. No modo local ela identifica o snapshot enviado pelo WhatsMiau; no modo `Central` referencia o template provisionado no servico externo. Este modulo nao faz chamadas externas.
