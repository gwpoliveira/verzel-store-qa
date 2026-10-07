# Relatório de Evidências de Execução de Testes
**Projeto:** Verzel Store — Teste Técnico QA Júnior  
**Ambiente:** `https://verzel-store.qa-test-verzel-store.workers.dev/`  
**Data da Execução:** 07/10/2026  
**Responsável:** Time de QA / Maestro  

---

## 1. Sumário Executivo da Execução

Todos os cenários levantados na especificação BDD foram submetidos a testes manuais exploratórios, testes de contrato via API e testes automatizados de ponta a ponta (E2E) com o framework **Playwright**.

* **Total de Cenários Executados:** 21
* **Aprovados (Conformes):** 19 (90,5%)
* **Reprovados (Com Defeito Identificado):** 2 (9,5%)
* **Bugs Catalogados:** `BUG-001` (Crítico/Alto) e `BUG-002` (Alto)

---

## 2. Evidências dos Defeitos Identificados

### Evidência 1: BUG-001 — Falha no Limiar de R$ 200,00 de Frete Grátis

#### Requisição HTTP (Subtotal exato de R$ 200,00):
```http
POST /api/carrinho/calcular HTTP/1.1
Host: verzel-store.qa-test-verzel-store.workers.dev
Content-Type: application/json

{
  "itens": [
    { "produtoId": "P005", "quantidade": 2 }
  ]
}
```

#### Resposta HTTP Inconsistente (Status 200 OK):
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

#### Inconsistência Observada na Interface:
* **Valor Faltante Informado:** `"Faltam R$ 0,00 para o frete grátis."`
* **Cobrança Efetiva:** Frete de **R$ 19,90** somado ao total (**R$ 219,90**).
* **Violação:** O Critério `CA06` define: *"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*.

---

### Evidência 2: BUG-002 — Burlar Limite de 5 Unidades via API

#### Requisição HTTP (Tentativa de pedido com 6 unidades):
```http
POST /api/pedidos HTTP/1.1
Host: verzel-store.qa-test-verzel-store.workers.dev
Content-Type: application/json

{
  "cliente": {
    "nome": "João Silva",
    "email": "joao.silva@exemplo.com",
    "cep": "01310-100"
  },
  "itens": [
    { "produtoId": "P001", "quantidade": 6 }
  ]
}
```

#### Resposta HTTP Não Conforme (Status 201 Created):
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
* **Violação:** O Critério `CA10` exige: *"Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."*. A API deveria responder **Status 422 QUANTIDADE_MAXIMA_EXCEDIDA**.

---

## 3. Evidências de Cenários Conformes (Aprovados)

### 3.1. Aplicação do Cupom BEMVINDO10 (Status 200 OK)
* **Payload:** Subtotal R$ 59,90 (1x Camiseta Essencial) + Cupom `"BEMVINDO10"`.
* **Resultado:**
  * Desconto: `R$ 5,99` (10% exato)
  * Frete: `R$ 19,90`
  * Total: `R$ 73,81`
  * Status: **PASS**

### 3.2. Cupom Expirado VERAO2026
* **Cálculo de Carrinho:** Retorna `200 OK` com `cupom: { aplicado: false, mensagem: "Cupom expirado." }`.
* **Criação de Pedido:** Retorna `422 Unprocessable Entity` com `codigo: "CUPOM_EXPIRADO"`.
* **Status:** **PASS**

### 3.3. Elegibilidade de Frete Grátis com Cupom (CA08)
* **Payload:** Subtotal R$ 219,80 (Tênis R$ 189,90 + Meias R$ 29,90) + Cupom `"BEMVINDO10"`.
* **Resultado:**
  * Subtotal: `R$ 219,80` (>= 200, logo elegível a frete grátis)
  * Desconto: `R$ 21,98`
  * Frete: `R$ 0,00` (Gratuidade preservada mesmo com valor líquido de R$ 197,82)
  * Total: `R$ 197,82`
  * Status: **PASS**

### 3.4. Fluxo Completo de Checkout
* **Preenchimento de formulário:** Carlos Eduardo Santos, `carlos.santos@exemplo.com`, `01310-100`.
* **Confirmação gerada:** Código `VZ-XXXXXX` exibido na tela `/pedido-confirmado`.
* **Carrinho na sessão:** Esvaziado com sucesso.
* **Status:** **PASS**
