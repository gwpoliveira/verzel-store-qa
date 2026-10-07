# Especificação de Cenários de Teste em BDD / Gherkin
**Projeto:** Verzel Store — Teste Técnico QA Júnior  
**Entrega:** Card VZS-142 (Cupom de Desconto e Frete Grátis)  
**Padrão Metodológico:** Behavior-Driven Development (BDD) com Gherkin  

---

## Índice de Funcionalidades
1. [Funcionalidade 1: Aplicação e Regras de Cupom de Desconto](#funcionalidade-1-aplicação-e-regras-de-cupom-de-desconto)
2. [Funcionalidade 2: Cálculo e Limiares de Frete Grátis](#funcionalidade-2-cálculo-e-limiares-de-frete-grátis)
3. [Funcionalidade 3: Regras Cumulativas, Descontos e Frete](#funcionalidade-3-regras-cumulativas-descontos-e-frete)
4. [Funcionalidade 4: Limites de Quantidade e Integridade do Carrinho](#funcionalidade-4-limites-de-quantidade-e-integridade-do-carrinho)
5. [Funcionalidade 5: Checkout e Confirmação de Pedido](#funcionalidade-5-checkout-e-confirmação-de-pedido)
6. [Funcionalidade 6: Contrato e Validações da API REST](#funcionalidade-6-contrato-e-validações-da-api-rest)

---

## Funcionalidade 1: Aplicação e Regras de Cupom de Desconto

Como cliente da Verzel Store  
Eu quero aplicar um cupom de desconto no meu carrinho  
Para obter abatimento no valor dos produtos adquiridos  

### Cenário: CT01 - Aplicação com sucesso do cupom válido BEMVINDO10
* **Referência:** Critério de Aceite `CA01`
```gherkin
Dado que o cliente possui o produto "Camiseta Essencial" (R$ 59,90) no carrinho
Quando o cliente informa o código "BEMVINDO10" no campo de cupom
E clica no botão "Aplicar cupom"
Então o sistema deve exibir a mensagem "Cupom BEMVINDO10 aplicado."
E a linha de Desconto deve apresentar "- R$ 5,99" (10% sobre o subtotal de R$ 59,90)
E o total da compra deve ser atualizado para refletir o desconto concedido
```

### Cenário: CT02 - Aplicação de cupom válido com letras minúsculas (Case Insensitive)
* **Referência:** Critério de Aceite `CA02`
```gherkin
Dado que o cliente possui produtos no carrinho com subtotal de R$ 100,00
Quando o cliente digita o cupom "bemvindo10" em letras minúsculas
E clica em "Aplicar cupom"
Então o sistema deve validar e aceitar o cupom com sucesso
E deve conceder o desconto de 10% (R$ 10,00)
```

### Cenário: CT03 - Aplicação de cupom com espaços em branco nas extremidades (Trim)
* **Referência:** Critério de Aceite `CA02`
```gherkin
Dado que o cliente possui produtos no carrinho
Quando o cliente digita o código com espaços no início e no final: "   BEMVINDO10   "
E clica em "Aplicar cupom"
Então o sistema deve sanitizar os espaços em branco
E deve aplicar com sucesso o cupom com 10% de desconto
```

### Cenário: CT04 - Tentativa de aplicar código de cupom inexistente
* **Referência:** Critério de Aceite `CA03`
```gherkin
Dado que o cliente possui produtos no carrinho
Quando o cliente informa o cupom "CUPOMFALSO123"
E clica em "Aplicar cupom"
Então o sistema deve exibir a mensagem de erro "Cupom inválido."
E nenhum desconto deve ser aplicado ao subtotal
E o valor do total a pagar deve permanecer inalterado
```

### Cenário: CT05 - Tentativa de aplicar cupom fora da validade (Expirado)
* **Referência:** Critério de Aceite `CA04`
```gherkin
Dado que o cliente possui produtos no carrinho
Quando o cliente informa o cupom "VERAO2026" (expirado em 31/03/2026)
E clica em "Aplicar cupom"
Então o sistema deve exibir a mensagem de erro "Cupom expirado."
E nenhum desconto deve ser concedido
```

### Cenário: CT06 - Tentativa de aplicar múltiplos cupons simultâneos (Unicidade)
* **Referência:** Critério de Aceite `CA05`
```gherkin
Dado que o cliente já possui o cupom "BEMVINDO10" aplicado no carrinho
Quando o cliente visualiza a área de cupons
Então o formulário de inserção de novo cupom não deve permitir inclusão cumulativa
E deve ser exibido o cupom ativo com a opção "Remover cupom"
```

### Cenário: CT07 - Remoção voluntária de cupom aplicado
* **Referência:** Critério de Aceite `CA05`
```gherkin
Dado que o cliente possui o cupom "BEMVINDO10" aplicado com R$ 20,00 de desconto
Quando o cliente clica no botão "Remover cupom"
Então o cupom deve ser desvinculado do carrinho
E a linha de desconto deve retornar para "R$ 0,00"
E o valor total do pedido deve ser recalculado sem o desconto
E o campo para inserção de um novo cupom deve ficar novamente disponível
```

### Cenário: CT08 - Tentativa de submissão do campo de cupom em branco
* **Referência:** Validação de Usabilidade / Frontend
```gherkin
Dado que o cliente está na página do carrinho
Quando o cliente clica em "Aplicar cupom" sem preencher nada no campo
Então o sistema deve exibir o alerta "Informe um cupom."
E nenhuma requisição de cálculo inválida deve alterar os totais
```

---

## Funcionalidade 2: Cálculo e Limiares de Frete Grátis

Como cliente da Verzel Store  
Eu quero ser informado sobre o custo do frete e o progresso para gratuidade  
Para saber as condições de entrega da minha compra  

### Cenário: CT09 - Compra com subtotal abaixo de R$ 200,00 (Frete Fixo e Aviso)
* **Referência:** Critério de Aceite `CA07`
```gherkin
Dado que o cliente adiciona 1 unidade da "Camiseta Essencial" (R$ 59,90) ao carrinho
Quando o cliente visualiza o resumo do pedido
Então o frete deve ser cobrado no valor fixo de "R$ 19,90"
E o sistema deve exibir a mensagem informativa "Faltam R$ 140,10 para o frete grátis."
E o total a pagar deve ser "R$ 79,80" (R$ 59,90 + R$ 19,90)
```

### Cenário: CT10 - Compra com subtotal no limite exato de R$ 200,00 (Caso de Borda / Defeito Detectado)
* **Referência:** Critério de Aceite `CA06` ("a partir de R$ 200,00, inclusive")
```gherkin
Dado que o cliente adiciona 2 unidades da "Mochila Urbana 20L" (2 x R$ 100,00 = R$ 200,00)
Quando o cliente visualiza o resumo do pedido
Então o frete deve ser exibido como "Grátis" (R$ 0,00)
E a mensagem "Faltam ... para o frete grátis" NÃO deve ser exibida
E o total a pagar deve ser exatamente "R$ 200,00"
```

### Cenário: CT11 - Compra com subtotal superior a R$ 200,00
* **Referência:** Critério de Aceite `CA06`
```gherkin
Dado que o cliente adiciona 1 unidade da "Jaqueta Corta-Vento" (R$ 229,90) ao carrinho
Quando o cliente acessa o carrinho
Então o frete deve ser calculado automaticamente como "Grátis"
E o valor total do pedido deve ser exatamente "R$ 229,90" sem cobrança de taxa de entrega
```

---

## Funcionalidade 3: Regras Cumulativas, Descontos e Frete

Como analista de negócios e cliente da Verzel Store  
Eu quero que o desconto incida corretamente sem prejudicar o benefício do frete  
Para que as regras de precificação sejam transparentes  

### Cenário: CT12 - Elegibilidade do frete grátis avaliada antes do desconto do cupom
* **Referência:** Critério de Aceite `CA08`
```gherkin
Dado que o cliente possui itens com subtotal original de R$ 219,80 (Tênis R$ 189,90 + Meias R$ 29,90)
E o subtotal antes do desconto já atinge a regra de frete grátis (>= R$ 200,00)
Quando o cliente aplica o cupom "BEMVINDO10", reduzindo o valor dos produtos para R$ 197,82
Então o frete deve PERMANECER "Grátis" (R$ 0,00)
E o total final deve ser calculado como R$ 197,82 (Subtotal R$ 219,80 - Desconto R$ 21,98 + Frete R$ 0,00)
```

### Cenário: CT13 - Não incidência do desconto do cupom sobre o frete cobrado
* **Referência:** Critério de Aceite `CA09`
```gherkin
Dado que o cliente possui 1 unidade da "Camiseta Essencial" (R$ 59,90) com frete de R$ 19,90
Quando o cliente aplica o cupom "BEMVINDO10" de 10%
Então o desconto deve ser calculado estritamente sobre os produtos: 10% de R$ 59,90 = R$ 5,99
E o frete de R$ 19,90 deve ser mantido integralmente sem abatimento percentual
E o total deve ser R$ 73,81 (59,90 - 5,99 + 19,90)
```

### Cenário: CT14 - Precisão e arredondamento monetário de duas casas decimais
* **Referência:** Critério de Aceite `CA11`
```gherkin
Dado que o cliente possui itens com preços fracionados
Quando os cálculos de subtotal, desconto percentual, frete e total final são processados
Então nenhum campo deve apresentar dízimas periódicas ou inconsistência de ponto flutuante
E todos os valores devem ser estritamente formatados com 2 casas decimais (ex.: R$ 73,81)
```

---

## Funcionalidade 4: Limites de Quantidade e Integridade do Carrinho

Como gerente de loja  
Eu quero limitar a quantidade de cada produto por pedido  
Para evitar abusos e manter o estoque sob controle  

### Cenário: CT15 - Limite máximo de 5 unidades por produto na Interface
* **Referência:** Critério de Aceite `CA10`
```gherkin
Dado que o cliente adicionou 5 unidades do produto "Camiseta Essencial" ao carrinho
Quando o cliente tenta clicar novamente no botão de incremento "+"
Então o botão de incremento deve estar desabilitado
E o sistema deve exibir a indicação "Limite de 5 unidades por produto."
E a quantidade não deve ultrapassar 5 unidades
```

### Cenário: CT16 - Bloqueio de quantidade superior a 5 via API (Defeito Detectado)
* **Referência:** Critério de Aceite `CA10` e Tabela de Erros HTTP `422 QUANTIDADE_MAXIMA_EXCEDIDA`
```gherkin
Dado que uma requisição POST é enviada diretamente ao endpoint "/api/carrinho/calcular" ou "/api/pedidos"
Com a quantidade de 6 unidades para o produto "P001"
Quando a API processa a solicitação
Então a API DEVE responder com Status HTTP 422 Unprocessable Entity
E o corpo da resposta deve conter o código de erro "QUANTIDADE_MAXIMA_EXCEDIDA"
```

### Cenário: CT17 - Validação de item duplicado na lista da API
* **Referência:** Tabela de Erros HTTP `422 ITEM_DUPLICADO`
```gherkin
Dado que uma requisição POST é enviada para "/api/carrinho/calcular"
Contendo duas linhas com o mesmo "produtoId": "P001"
Quando a API valida o payload
Então a API deve responder com Status HTTP 422
E deve informar o código de erro "ITEM_DUPLICADO" no campo correspondente
```

---

## Funcionalidade 5: Checkout e Confirmação de Pedido

Como cliente da Verzel Store  
Eu quero preencher meus dados cadastrais e concluir minha compra  
Para receber a confirmação com o número do meu pedido  

### Cenário: CT18 - Checkout bem-sucedido com cupom e frete aplicados
* **Referência:** Fluxo End-to-End de Compra
```gherkin
Dado que o cliente possui o produto "Mochila Urbana 20L" e aplicou o cupom "BEMVINDO10"
E clica em "Finalizar compra" avançando para a rota "/checkout"
Quando o cliente preenche:
  | Campo | Valor |
  | Nome completo | Maria Silva |
  | E-mail | maria.silva@exemplo.com |
  | CEP | 01310-100 |
E clica em "Finalizar pedido"
Então o sistema deve enviar a requisição para "/api/pedidos"
E deve redirecionar o cliente para a página "/pedido-confirmado"
E deve apresentar o número do pedido no formato "VZ-XXXXXX"
E deve exibir o resumo idêntico com subtotal, desconto de cupom, frete e total final
E o carrinho na sessão deve ser esvaziado
```

### Cenário: CT19 - Validação de campos obrigatórios no formulário de Checkout
* **Referência:** Validações de Formulário
```gherkin
Dado que o cliente está na tela de Checkout
Quando o cliente tenta submeter o formulário com dados inválidos:
  | Campo | Valor Inserido | Mensagem Esperada |
  | Nome | "João" | "Informe nome e sobrenome." |
  | E-mail | "joao.teste" | "Informe um e-mail válido." |
  | CEP | "1234" | "Informe um CEP com 8 dígitos." |
Então o formulário não deve permitir a submissão
E deve destacar as mensagens de erro sob cada campo respectivo
```

---

## Funcionalidade 6: Contrato e Validações da API REST

Como integrador ou serviço cliente da API Verzel Store  
Eu quero que os endpoints validem estritamente as regras de negócio  
Para garantir confiabilidade e integridade sistêmica  

### Cenário: CT20 - Pedido enviado com cupom inválido na API
* **Referência:** Contrato `/api/pedidos` (Status 422)
```gherkin
Dado uma requisição POST para "/api/pedidos" com dados de cliente válidos
E com o campo "cupom": "CUPOM_INEXISTENTE"
Quando a requisição é processada
Então o status HTTP deve ser 422 Unprocessable Entity
E o JSON de resposta deve conter:
  """
  {
    "erro": {
      "codigo": "CUPOM_INVALIDO",
      "mensagem": "Cupom inválido.",
      "campo": "cupom"
    }
  }
  """
```

### Cenário: CT21 - Pedido enviado com cupom expirado na API
* **Referência:** Contrato `/api/pedidos` (Status 422)
```gherkin
Dado uma requisição POST para "/api/pedidos" com dados de cliente válidos
E com o campo "cupom": "VERAO2026"
Quando a requisição é processada
Então o status HTTP deve ser 422 Unprocessable Entity
E o JSON de resposta deve conter:
  """
  {
    "erro": {
      "codigo": "CUPOM_EXPIRADO",
      "mensagem": "Cupom expirado.",
      "campo": "cupom"
    }
  }
  """
```
