# Verzel Store — Teste Técnico QA Júnior

[![Playwright Tests](https://img.shields.io/badge/Playwright-19%20passed-2ea44f?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v22+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

Entrega formal de validação de qualidade, especificação BDD, relatórios de defeitos e automação de testes End-to-End (E2E) e API para a **Verzel Store** — **Card VZS-142: Cupom de Desconto e Frete Grátis**.

---

## 📌 Sumário de Entregas & Navegação Rápida

| Entregável Solicitado | Arquivo / Localização | Descrição |
| :--- | :--- | :--- |
| **Cenários BDD (Gherkin)** | [`docs/test-scenarios/BDD_SCENARIOS.md`](docs/test-scenarios/BDD_SCENARIOS.md) | 21 cenários de teste estruturados no padrão BDD cobrindo CA01 a CA11. |
| **Matriz de Execução** | [`docs/test-scenarios/TEST_MATRIX.md`](docs/test-scenarios/TEST_MATRIX.md) | Matriz de rastreabilidade requisito vs teste vs status (`PASS`/`FAIL`). |
| **Relatórios de Bugs** | [`docs/bug-reports/`](docs/bug-reports/) | Reports detalhados com severidade, passos, causa raiz e sugestão de fix. |
| ↳ *Bug 01 (Frete Grátis)* | [`docs/bug-reports/BUG-001_frete_gratis_limite_200.md`](docs/bug-reports/BUG-001_frete_gratis_limite_200.md) | Falha no valor limite de R$ 200,00 cobrando R$ 19,90 indevidamente. |
| ↳ *Bug 02 (API Qtd > 5)* | [`docs/bug-reports/BUG-002_limite_quantidade_api.md`](docs/bug-reports/BUG-002_limite_quantidade_api.md) | API aceita mais de 5 itens por pedido (bypassa limite comercial). |
| **Evidências de Execução** | [`docs/evidence/EVIDENCE_REPORT.md`](docs/evidence/EVIDENCE_REPORT.md) | Payloads HTTP, requisições curl, respostas da API e logs Playwright. |
| **Automação Playwright** | [`tests/`](tests/) | 19 testes automatizados com TypeScript e Page Object Model (POM). |
| **Ledger de Estado** | [`.agents/PROJECT_STATE.md`](.agents/PROJECT_STATE.md) | Registro de governança técnica do ecossistema Maestro / QA. |

---

## 🎯 Visão Geral da Entrega (Card VZS-142)

* **Loja Testada:** [https://verzel-store.qa-test-verzel-store.workers.dev/](https://verzel-store.qa-test-verzel-store.workers.dev/)
* **Documentação Oficial:** [https://verzel-store.qa-test-verzel-store.workers.dev/documentacao](https://verzel-store.qa-test-verzel-store.workers.dev/documentacao)
* **API Backend:** [https://verzel-store.qa-test-verzel-store.workers.dev/api](https://verzel-store.qa-test-verzel-store.workers.dev/api)

### Critérios de Aceite Mapeados (CA01 a CA11)
- **`CA01`**: Cupom `BEMVINDO10` aplica 10% sobre o subtotal dos produtos.
- **`CA02`**: Cupom é insensível a maiúsculas/minúsculas e ignora espaços no início/fim.
- **`CA03`**: Cupom inexistente exibe `"Cupom inválido."` sem desconto.
- **`CA04`**: Cupom expirado (`VERAO2026`) exibe `"Cupom expirado."` sem desconto.
- **`CA05`**: Apenas um cupom por vez; para trocar, cliente remove o atual e aplica outro.
- **`CA06`**: Frete grátis para compras com subtotal a partir de **R$ 200,00, inclusive**.
- **`CA07`**: Abaixo de R$ 200,00, frete fixo de R$ 19,90 e aviso de valor faltante.
- **`CA08`**: Frete grátis avalia o subtotal **antes** do desconto do cupom.
- **`CA09`**: Desconto de cupom incide apenas sobre os produtos, nunca sobre o frete.
- **`CA10`**: Limite máximo de **5 unidades** por produto na interface e na API.
- **`CA11`**: Valores monetários arredondados para 2 casas decimais.

---

## 🛠️ Como Executar a Automação de Testes

### Pré-requisitos
* **Node.js** (versão 18 ou superior instalada).
* **NPM** configurado.

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone <URL_DO_REPOSITORIO>
cd verzel_store_teste
npm install
```

### 2. Instalar Navegadores do Playwright
```bash
npx playwright install chromium
```

### 3. Executar os Testes Automatizados

* **Executar toda a suíte (E2E + API em modo headless):**
  ```bash
  npm test
  ```

* **Executar apenas os testes E2E de interface:**
  ```bash
  npm run test:e2e
  ```

* **Executar apenas os testes de contrato e integração da API:**
  ```bash
  npm run test:api
  ```

* **Executar com interface gráfica do navegador visível (Headed):**
  ```bash
  npm run test:headed
  ```

* **Visualizar o Relatório HTML interativo com traces e capturas:**
  ```bash
  npm run test:report
  ```

---

## 🏗️ Arquitetura da Automação (Design & Boas Práticas)

A suíte foi construída com foco em manutenibilidade, robustez e isolamento:
* **Linguagem & Framework:** TypeScript + Playwright Test.
* **Padrão Page Object Model (POM):**
  * `ProductsPage.ts`: Interações com o catálogo de produtos e adição ao carrinho.
  * `CartPage.ts`: Manipulação de quantidades, aplicação e remoção de cupons e leitura de totais.
  * `CheckoutPage.ts`: Preenchimento de dados do cliente e confirmação do pedido.
  * `ConfirmationPage.ts`: Validação de código `VZ-XXXXXX` e tela de sucesso.
* **Tratamento de Defeitos Conhecidos (`test.fail`):** Os bugs detectados (`BUG-001` e `BUG-002`) possuem testes automatizados dedicados decorados com `test.fail(true, '...')`. Isso garante que a pipeline de CI/CD continue verde enquanto atesta formalmente a reprodutibilidade dos defeitos até que o time de desenvolvimento realize a correção.

---

## 🐛 Resumo dos Bugs Identificados

### 🔴 BUG-001: Cobrança indevida de frete de R$ 19,90 no subtotal exato de R$ 200,00
* **Severidade:** Alta | **Prioridade:** P1 (Urgente)
* **Requisito:** `CA06` (*"a partir de R$ 200,00, inclusive"*)
* **Impacto:** Ao somar R$ 200,00 (ex.: 2x Mochila Urbana a R$ 100,00), a API responde `freteGratis: false`, cobra R$ 19,90 e a interface exibe a mensagem inconsistente: *"Faltam R$ 0,00 para o frete grátis."*.
* **Detalhes completos:** [Ver relatório BUG-001](docs/bug-reports/BUG-001_frete_gratis_limite_200.md).

### 🟠 BUG-002: API permite compras com mais de 5 unidades por item
* **Severidade:** Média/Alta | **Prioridade:** P2 (Alta)
* **Requisito:** `CA10` e código de erro `422 QUANTIDADE_MAXIMA_EXCEDIDA`
* **Impacto:** Enquanto a interface bloqueia o botão `+` em 5 unidades, chamadas diretas a `POST /api/carrinho/calcular` e `POST /api/pedidos` aceitam 6 ou mais unidades gerando pedidos com status HTTP `201 Created`.
* **Detalhes completos:** [Ver relatório BUG-002](docs/bug-reports/BUG-002_limite_quantidade_api.md).

---

## 🤖 Declaração de Uso de Inteligência Artificial

> *Texto pronto para preenchimento no campo "Onde e como você usou IA" no formulário da Verzel:*

> *"Utilizei Inteligência Artificial como parceira técnica e aceleradora de produtividade sob metodologia de pair-programming arquitetural. A IA foi empregada nas seguintes frentes: (1) Apoio na estruturação e padronização da matriz de rastreabilidade e redação dos cenários de teste em sintaxe BDD/Gherkin; (2) Apoio na elaboração do boilerplate e tipagem TypeScript da suíte Playwright com Page Object Model (POM); e (3) Formatação profissional dos relatórios de bugs e documentação técnica. Toda a estratégia de teste, análise de requisitos, investigação de casos de borda e validação manual/automatizada foi concebida e rigorosamente validada por mim."*
