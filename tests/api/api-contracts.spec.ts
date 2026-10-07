import { test, expect } from '@playwright/test';

test.describe('Contratos e Validações de API REST (/api)', () => {
  const baseURL = 'https://verzel-store.qa-test-verzel-store.workers.dev/api';

  test('Deve listar os 8 produtos cadastrados com seus respectivos preços', async ({ request }) => {
    const res = await request.get(`${baseURL}/produtos`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(8);

    const p001 = body.find((p: any) => p.id === 'P001');
    expect(p001).toMatchObject({
      id: 'P001',
      nome: 'Camiseta Essencial',
      preco: 59.9,
    });
  });

  test('Deve responder 404 PRODUTO_NAO_ENCONTRADO para ID inexistente', async ({ request }) => {
    const res = await request.get(`${baseURL}/produtos/P999`);
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.erro.codigo).toBe('PRODUTO_NAO_ENCONTRADO');
  });

  test('Deve responder 405 METODO_NAO_PERMITIDO para verbo HTTP inválido', async ({ request }) => {
    const res = await request.delete(`${baseURL}/produtos`);
    expect(res.status()).toBe(405);

    const body = await res.json();
    expect(body.erro.codigo).toBe('METODO_NAO_PERMITIDO');
  });

  test('Deve responder 400 JSON_INVALIDO quando payload for malformado', async ({ request }) => {
    const res = await request.post(`${baseURL}/carrinho/calcular`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'invalid{json',
    });
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.erro.codigo).toBe('JSON_INVALIDO');
  });

  test('Deve responder 422 ITEM_DUPLICADO quando produto for enviado repetido na lista', async ({ request }) => {
    const res = await request.post(`${baseURL}/carrinho/calcular`, {
      data: {
        itens: [
          { produtoId: 'P001', quantidade: 1 },
          { produtoId: 'P001', quantidade: 2 },
        ],
      },
    });
    expect(res.status()).toBe(422);

    const body = await res.json();
    expect(body.erro.codigo).toBe('ITEM_DUPLICADO');
  });

  test('Deve responder 422 CUPOM_INVALIDO em /api/pedidos para cupom inexistente', async ({ request }) => {
    const res = await request.post(`${baseURL}/pedidos`, {
      data: {
        cliente: { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' },
        itens: [{ produtoId: 'P001', quantidade: 1 }],
        cupom: 'CUPOM_INEXISTENTE_XYZ',
      },
    });
    expect(res.status()).toBe(422);

    const body = await res.json();
    expect(body.erro.codigo).toBe('CUPOM_INVALIDO');
  });

  test('Deve responder 422 CUPOM_EXPIRADO em /api/pedidos para VERAO2026', async ({ request }) => {
    const res = await request.post(`${baseURL}/pedidos`, {
      data: {
        cliente: { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' },
        itens: [{ produtoId: 'P001', quantidade: 1 }],
        cupom: 'VERAO2026',
      },
    });
    expect(res.status()).toBe(422);

    const body = await res.json();
    expect(body.erro.codigo).toBe('CUPOM_EXPIRADO');
  });

  test('CT16 [BUG-002] - API deve bloquear quantidade > 5 com HTTP 422 QUANTIDADE_MAXIMA_EXCEDIDA', async ({ request }) => {
    test.fail(true, 'BUG-002: API aceita pedidos com 6 unidades (responde 201 Created em vez de 422 QUANTIDADE_MAXIMA_EXCEDIDA)');

    const res = await request.post(`${baseURL}/pedidos`, {
      data: {
        cliente: { nome: 'Maria Silva', email: 'maria@exemplo.com', cep: '01310-100' },
        itens: [{ produtoId: 'P001', quantidade: 6 }],
      },
    });

    // Validação do Critério CA10 e tabela de erros
    const status = res.status();
    const body = await res.json();

    expect(status, `BUG-002: API aceitou pedido com 6 unidades (retornou HTTP ${status} em vez de 422)`).toBe(422);
    expect(body.erro?.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
  });
});
