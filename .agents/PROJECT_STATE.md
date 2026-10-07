# LEDGER DE ESTADO DO PROJETO - VERZEL STORE QA JÚNIOR
> **Gerenciado pelo ecossistema de Agentes Especialistas & Maestro (Tech Lead)**

---

## 1. INFORMAÇÕES DO PROJETO
* **Projeto:** Teste Técnico QA Júnior — Verzel Store
* **Card / Entrega:** `VZS-142` (Cupom de Desconto & Frete Grátis)
* **URL da Aplicação:** `https://verzel-store.qa-test-verzel-store.workers.dev/`
* **URL da Documentação:** `https://verzel-store.qa-test-verzel-store.workers.dev/documentacao`
* **URL da API:** `https://verzel-store.qa-test-verzel-store.workers.dev/api`
* **Tech Lead / Orquestrador:** Maestro
* **Especialista Alocado:** Subagente de QA & Testes Automatizados

---

## 2. STATUS DOS QUALITY GATES

| Quality Gate | Responsável | Status | Observações |
| :--- | :--- | :---: | :--- |
| **01. Mapeamento de Requisitos** | Maestro | **APROVADO** | 11 Critérios de Aceite mapeados, contratos de API e regras "Sobre este ambiente" analisadas. |
| **02. Engenharia de Testes (BDD)** | QA & Testes | **APROVADO** | 21 Cenários BDD/Gherkin e Matriz de Rastreabilidade gerados em `docs/test-scenarios/`. |
| **03. Execução & Bug Reports** | QA & Testes | **APROVADO** | 2 defeitos críticos reportados em `docs/bug-reports/` com causa raiz e evidências. |
| **04. Automação Playwright** | QA & Testes | **APROVADO** | 19 testes automatizados com TypeScript e Page Object Model passando com saída limpa. |
| **05. Relatórios & Evidências** | Docs & Reports | **APROVADO** | `EVIDENCE_REPORT.md` e `README.md` executivo finalizados no padrão internacional. |

---

## 3. MAPA DE ARTEFATOS DO REPOSITÓRIO

```
verzel_store_teste/
├── .agents/
│   └── PROJECT_STATE.md               # Ledger vivo do projeto
├── docs/
│   ├── test-scenarios/
│   │   ├── BDD_SCENARIOS.md           # Especificação formal BDD / Gherkin
│   │   └── TEST_MATRIX.md             # Matriz de Rastreabilidade e Execução
│   ├── bug-reports/
│   │   ├── BUG-001_frete_gratis_limite_200.md
│   │   └── BUG-002_limite_quantidade_api.md
│   └── evidence/
│       ├── api-payloads/
│       └── screenshots/
├── tests/
│   ├── e2e/
│   │   ├── pages/
│   │   ├── coupon.spec.ts
│   │   ├── shipping.spec.ts
│   │   └── checkout.spec.ts
│   └── api/
│       └── api-contracts.spec.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```
