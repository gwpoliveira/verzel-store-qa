# Relatório de Defeito: BUG-001

| Campo | Detalhe |
| :--- | :--- |
| **ID do Bug** | `BUG-001` |
| **Título** | Cobrança indevida de frete fixo (R$ 19,90) e estado inconsistente para compra com subtotal exato de R$ 200,00 |
| **Severidade** | **Alta** (Cobrança financeira indevida do cliente e quebra direta da promoção) |
| **Prioridade** | **P1 (Urgente)** |
| **Componente** | Backend (`/api/carrinho/calcular`, `/api/pedidos`) & Frontend (Aviso de Frete) |
| **Requisito Violado** | `CA06` (*"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*) |
| **Ambiente** | Produção / Worker (`https://verzel-store.qa-test-verzel-store.workers.dev/`) |
| **Relator** | QA Engineer / Maestro |
| **Data** | 07/10/2026 |

---

## 1. Descrição Sumária
Ao adicionar produtos ao carrinho cujo subtotal totalize exatamente **R$ 200,00** (ex.: 2 unidades de Mochila Urbana 20L a R$ 100,00 cada), o sistema não concede o frete grátis. Em vez disso, o sistema:
1. Marca a flag `freteGratis: false` e adiciona **R$ 19,90** ao total final (cobrando **R$ 219,90**).
2. Retorna `valorFaltanteFreteGratis: 0`.
3. Na interface do carrinho, renderiza a mensagem incoerente: *"Faltam R$ 0,00 para o frete grátis."*.

---

## 2. Passos para Reproduzir

### Pela Interface Web (E2E):
1. Acesse a vitrine da loja: `https://verzel-store.qa-test-verzel-store.workers.dev/`.
2. Localize o produto **"Mochila Urbana 20L"** (R$ 100,00 cada).
3. Clique em **"Adicionar ao carrinho"**.
4. Acesse a página do Carrinho (`/carrinho`).
5. No seletor de quantidade da Mochila, clique no botão `+` para elevar a quantidade para **2**.
6. Observe o valor do Subtotal, Frete, Total e a mensagem de aviso de frete exibida no resumo.

### Pela API (Curl / REST):
Dispare uma requisição `POST` para `https://verzel-store.qa-test-verzel-store.workers.dev/api/carrinho/calcular`:
```bash
curl -X POST https://verzel-store.qa-test-verzel-store.workers.dev/api/carrinho/calcular \
  -H "Content-Type: application/json" \
  -d '{
    "itens": [
      { "produtoId": "P005", "quantidade": 2 }
    ]
  }'
```

---

## 3. Comportamento Obtido (Atual)
A API responde com Status HTTP `200 OK` e o seguinte payload inconsistente:
```json
{
  "itens": [
    {
      "produtoId": "P005",
      "nome": "Mochila Urbana 20L",
      "precoUnitario": 100,
      "quantidade": 2,
      "total": 200
    }
  ],
  "subtotal": 200,
  "desconto": 0,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 0,
  "total": 219.9,
  "cupom": null
}
```
* **Na UI:** É exibida a mensagem `"Faltam R$ 0,00 para o frete grátis."` e o cliente é tarifado em R$ 19,90.
* **No Checkout (`/api/pedidos`):** Ao concluir o pedido, a cobrança de R$ 219,90 é concretizada no pedido `VZ-XXXXXX`.

---

## 4. Comportamento Esperado
De acordo com o Critério de Aceite `CA06`:
> *"O frete é grátis para compras com subtotal a partir de R$ 200,00, **inclusive**."*

1. O campo `frete` deve ser `0`.
2. O campo `freteGratis` deve ser `true`.
3. O campo `valorFaltanteFreteGratis` deve ser `0`.
4. O campo `total` deve ser `200`.
5. Na interface, a linha de Frete deve exibir `"Grátis"` e a mensagem de valor faltante **não** deve ser exibida.

---

## 5. Análise de Causa Raiz Sugerida (Dev Handoff)
Erro de operador condicional (Off-by-one boundary defect). A condicional que define o frete grátis provavelmente foi implementada como:
```javascript
// INCORRETO:
const freteGratis = subtotal > 200; // 200 > 200 resulta em false!
```
Enquanto o cálculo do valor faltante foi feito corretamente como:
```javascript
const valorFaltanteFreteGratis = Math.max(0, 200 - subtotal); // 200 - 200 resulta em 0
```
**Correção recomendada:**
Alterar a condição para maior ou igual (`>=`):
```javascript
// CORRETO:
const freteGratis = subtotal >= 200;
const frete = freteGratis ? 0 : 19.9;
```
