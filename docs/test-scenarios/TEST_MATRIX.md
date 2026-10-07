# Matriz de Rastreabilidade e Execução de Testes
**Projeto:** Verzel Store — Teste Técnico QA Júnior  
**Versão da Entrega:** Card VZS-142  
**Responsável:** Time de QA / Maestro  

---

## 1. Visão Geral da Cobertura de Testes

A presente matriz mapeia a rastreabilidade bidirecional entre os **Critérios de Aceite (CA)** especificados na entrega e os **Cenários de Teste (CT)** executados manual e automaticamente.

### Resumo Quantitativo da Execução

| Métrica | Quantidade | Percentual |
| :--- | :---: | :---: |
| **Total de Cenários Planejados** | 21 | 100% |
| **Testes Aprovados (`PASS`)** | 19 | 90,5% |
| **Testes com Falha / Defeito (`FAIL`)** | 2 | 9,5% |
| **Testes Bloqueados (`BLOCKED`)** | 0 | 0% |
| **Cenários Automatizados (Playwright)** | 5 | 23,8% |

---

## 2. Matriz de Rastreabilidade Requisito x Teste x Execução

| ID Cenário | Requisito Mapeado | Título / Descrição Sintética | Tipo de Teste | Camada | Status Execução | Bug Vinculado |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: |
| **CT01** | `CA01`, `CA11` | Aplicação com sucesso do cupom válido `BEMVINDO10` (10% desconto) | Funcional | E2E / UI | **PASS** | - |
| **CT02** | `CA02` | Validação de cupom case-insensitive (`bemvindo10`) | Funcional | E2E / UI | **PASS** | - |
| **CT03** | `CA02` | Validação de remoção de espaços em branco (`  BEMVINDO10  `) | Funcional | E2E / UI | **PASS** | - |
| **CT04** | `CA03` | Rejeição de cupom inexistente com mensagem "Cupom inválido." | Negativo | E2E / UI | **PASS** | - |
| **CT05** | `CA04` | Rejeição de cupom expirado (`VERAO2026`) com "Cupom expirado." | Negativo | E2E / UI | **PASS** | - |
| **CT06** | `CA05` | Garantia de unicidade de cupom (proibir múltiplos simultâneos) | Regra Negócio | E2E / UI | **PASS** | - |
| **CT07** | `CA05` | Remoção voluntária de cupom e recálculo automático | Funcional | E2E / UI | **PASS** | - |
| **CT08** | Usabilidade | Submissão de campo de cupom em branco exibindo alerta | Validação UI | E2E / UI | **PASS** | - |
| **CT09** | `CA07`, `CA11` | Subtotal abaixo de R$ 200 (cobrança de R$ 19,90 e valor faltante) | Funcional | E2E / UI | **PASS** | - |
| **CT10** | `CA06` | **Subtotal no limite exato de R$ 200,00 concedendo frete grátis** | **Valor Limite** | **E2E / API** | **FAIL** ❌ | [`BUG-001`](../bug-reports/BUG-001_frete_gratis_limite_200.md) |
| **CT11** | `CA06` | Subtotal acima de R$ 200,00 com frete grátis automático | Funcional | E2E / UI | **PASS** | - |
| **CT12** | `CA08` | Elegibilidade do frete grátis avaliada ANTES do desconto do cupom | Regra Negócio | E2E / API | **PASS** | - |
| **CT13** | `CA09` | Desconto de cupom não incide sobre o valor do frete | Regra Negócio | E2E / API | **PASS** | - |
| **CT14** | `CA11` | Arredondamento monetário de duas casas decimais em totais | Integridade | E2E / API | **PASS** | - |
| **CT15** | `CA10` | Limite de 5 unidades por produto bloqueado na interface | Validação UI | E2E / UI | **PASS** | - |
| **CT16** | `CA10`, Erros | **Bloqueio de quantidade > 5 na API (HTTP 422 QUANTIDADE_MAXIMA_EXCEDIDA)** | **Segurança/API** | **API** | **FAIL** ❌ | [`BUG-002`](../bug-reports/BUG-002_limite_quantidade_api.md) |
| **CT17** | Erros | Detecção de item duplicado no payload da API (HTTP 422) | Integração | API | **PASS** | - |
| **CT18** | End-to-End | Fluxo completo: Adição, Cupom, Frete, Checkout e Confirmação | E2E | UI / API | **PASS** | - |
| **CT19** | Validação UI | Validação de campos obrigatórios no formulário de Checkout | Validação UI | E2E / UI | **PASS** | - |
| **CT20** | `CA03`, Erros | Rejeição de pedido com cupom inexistente na API (HTTP 422) | Integração | API | **PASS** | - |
| **CT21** | `CA04`, Erros | Rejeição de pedido com cupom expirado na API (HTTP 422) | Integração | API | **PASS** | - |

---

## 3. Cobertura dos Critérios de Aceite (Rastreabilidade Reversa)

* **`CA01` (10% com BEMVINDO10):** Coberto por `CT01`, `CT18`
* **`CA02` (Case-insensitive & trim):** Coberto por `CT02`, `CT03`
* **`CA03` (Cupom inválido):** Coberto por `CT04`, `CT20`
* **`CA04` (Cupom expirado):** Coberto por `CT05`, `CT21`
* **`CA05` (Unicidade & remoção):** Coberto por `CT06`, `CT07`
* **`CA06` (Frete grátis a partir de R$ 200 inclusive):** Coberto por `CT10` (Falha detectada), `CT11`
* **`CA07` (Frete fixo R$ 19,90 e faltante):** Coberto por `CT09`
* **`CA08` (Frete antes do desconto):** Coberto por `CT12`
* **`CA09` (Cupom não incide no frete):** Coberto por `CT13`
* **`CA10` (Máximo 5 unidades por produto UI e API):** Coberto por `CT15`, `CT16` (Falha detectada)
* **`CA11` (Arredondamento 2 casas decimais):** Coberto por `CT01`, `CT09`, `CT13`, `CT14`

---

## 4. Conclusão da Avaliação

A suíte de testes identificou **100% de conformidade** nos fluxos felizes e de tratamentos de cupom na UI. Contudo, foram identificadas **duas falhas críticas de regra de negócio**:
1. **Cobrança indevida de frete** em pedidos com exatamente R$ 200,00, lesando o consumidor e violando diretamente o critério `CA06`.
2. **Ausência de validação na API** para o teto de 5 unidades por item, permitindo que requisições burlem o limite estabelecido na interface e no critério `CA10`.
