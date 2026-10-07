# Relatório de Defeito: BUG-002

| Campo | Detalhe |
| :--- | :--- |
| **ID do Bug** | `BUG-002` |
| **Título** | Ausência de validação do limite de 5 unidades por produto nos endpoints da API (`/api/carrinho/calcular` e `/api/pedidos`) |
| **Severidade** | **Média/Alta** (Burlar regras comerciais e de estoque via API) |
| **Prioridade** | **P2 (Alta)** |
| **Componente** | Backend (`POST /api/carrinho/calcular`, `POST /api/pedidos`) |
| **Requisito Violado** | `CA10` (*"Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."*) e Código de Erro `422 QUANTIDADE_MAXIMA_EXCEDIDA` |
| **Ambiente** | Produção / Worker (`https://verzel-store.qa-test-verzel-store.workers.dev/`) |
| **Relator** | QA Engineer / Maestro |
| **Data** | 07/10/2026 |

---

## 1. Descrição Sumária
O critério de aceite `CA10` determina explicitamente que nenhum produto pode ter mais de 5 unidades por pedido, tanto na interface quanto na API. Além disso, a documentação de erros prevê o código HTTP `422` com `codigo: "QUANTIDADE_MAXIMA_EXCEDIDA"`.

Entretanto, enquanto o frontend desabilita o botão `+` ao atingir 5 unidades, **a API não realiza nenhuma validação defensiva**. Requisições enviadas diretamente para a API com 6 ou mais unidades são processadas normalmente com HTTP `200 OK` (no cálculo) e HTTP `201 Created` (na criação de pedidos), permitindo contornar a regra comercial.

---

## 2. Passos para Reproduzir

Dispare uma requisição `POST` para `https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos`:
```bash
curl -X POST https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": {
      "nome": "João Silva",
      "email": "joao.silva@exemplo.com",
      "cep": "01310-100"
    },
    "itens": [
      { "produtoId": "P001", "quantidade": 6 }
    ]
  }'
```

---

## 3. Comportamento Obtido (Atual)
A API responde com Status HTTP `201 Created` e gera um pedido com 6 unidades:
```json
{
  "numero": "VZ-334354",
  "criadoEm": "2026-10-07T16:55:56.961Z",
  "cliente": {
    "nome": "João Silva",
    "email": "joao.silva@exemplo.com",
    "cep": "01310100"
  },
  "itens": [
    {
      "produtoId": "P001",
      "nome": "Camiseta Essencial",
      "precoUnitario": 59.9,
      "quantidade": 6,
      "total": 359.4
    }
  ],
  "subtotal": 359.4,
  "desconto": 0,
  "frete": 0,
  "freteGratis": true,
  "valorFaltanteFreteGratis": 0,
  "total": 359.4,
  "cupom": null
}
```

---

## 4. Comportamento Esperado
Conforme a especificação do `CA10` e da tabela oficial de erros da API:
1. A API deve rejeitar o pedido com Status HTTP `422 Unprocessable Entity`.
2. O corpo da resposta deve conter o erro estruturado:
```json
{
  "erro": {
    "codigo": "QUANTIDADE_MAXIMA_EXCEDIDA",
    "mensagem": "A quantidade de um produto não pode ser maior que 5.",
    "campo": "itens[0].quantidade"
  }
}
```

---

## 5. Análise de Causa Raiz Sugerida (Dev Handoff)
A validação de `quantidade <= 5` foi implementada somente no estado do React (`Qn = 5` no frontend) e não foi replicada nos middlewares/handlers de validação de payload no backend do Worker (`/api/carrinho/calcular` e `/api/pedidos`).

**Correção recomendada:**
No validador de itens do backend, adicionar a checagem:
```javascript
for (let i = 0; i < itens.length; i++) {
  const item = itens[i];
  if (item.quantidade > 5) {
    return jsonResponse(422, {
      erro: {
        codigo: "QUANTIDADE_MAXIMA_EXCEDIDA",
        mensagem: "A quantidade de um produto não pode ser maior que 5.",
        campo: `itens[${i}].quantidade`
      }
    });
  }
}
```
