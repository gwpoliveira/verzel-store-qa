import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage.js';
import { CartPage } from './pages/CartPage.js';

test.describe('Funcionalidade: Frete e Limiares de Gratuidade (Card VZS-142)', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    await productsPage.navigate();
  });

  test('CT09 - Subtotal abaixo de R$ 200 deve cobrar R$ 19,90 e exibir valor faltante', async () => {
    // Camiseta Essencial: R$ 59,90
    await productsPage.addProductToCart('Camiseta Essencial');
    await productsPage.goToCart();

    await expect(cartPage.subtotalValue).toHaveText('R$ 59,90');
    await expect(cartPage.shippingValue).toHaveText('R$ 19,90');
    await expect(cartPage.shippingNotice).toHaveText('Faltam R$ 140,10 para o frete grátis.');
    await expect(cartPage.totalValue).toHaveText('R$ 79,80');
  });

  test('CT11 - Subtotal acima de R$ 200 deve conceder frete grátis automaticamente', async () => {
    // Jaqueta Corta-Vento: R$ 229,90
    await productsPage.addProductToCart('Jaqueta Corta-Vento');
    await productsPage.goToCart();

    await expect(cartPage.subtotalValue).toHaveText('R$ 229,90');
    await expect(cartPage.shippingValue).toHaveText('Grátis');
    await expect(cartPage.shippingNotice).not.toBeVisible();
    await expect(cartPage.totalValue).toHaveText('R$ 229,90');
  });

  test('CT12 - Elegibilidade do frete grátis deve considerar subtotal antes do cupom', async () => {
    // Tênis Casual Urbano (R$ 189,90) + Kit 3 Pares de Meias (R$ 29,90) = Subtotal R$ 219,80
    await productsPage.addProductToCart('Tênis Casual Urbano');
    await productsPage.addProductToCart('Kit 3 Pares de Meias');
    await productsPage.goToCart();

    await expect(cartPage.subtotalValue).toHaveText('R$ 219,80');
    await expect(cartPage.shippingValue).toHaveText('Grátis');

    // Aplica cupom BEMVINDO10: desconto de 10% = R$ 21,98. Total de produtos cai para R$ 197,82 (< 200)
    await cartPage.applyCoupon('BEMVINDO10');

    await expect(cartPage.discountValue).toHaveText('- R$ 21,98');
    // Frete deve permanecer grátis conforme CA08
    await expect(cartPage.shippingValue).toHaveText('Grátis');
    await expect(cartPage.totalValue).toHaveText('R$ 197,82');
  });

  test('CT10 [BUG-001] - Subtotal no limite exato de R$ 200,00 deve conceder frete grátis', async () => {
    test.fail(true, 'BUG-001: Subtotal de R$ 200,00 é tarifado com R$ 19,90 devido a defeito de operador off-by-one (subtotal > 200 em vez de >= 200)');

    // Adiciona 2 unidades de Mochila Urbana 20L (2 x R$ 100,00 = R$ 200,00)
    await productsPage.addProductToCart('Mochila Urbana 20L');
    await productsPage.goToCart();
    await cartPage.increaseItemQuantity('Mochila Urbana 20L');

    await expect(cartPage.subtotalValue).toHaveText('R$ 200,00');

    // Validação do Critério CA06: a partir de R$ 200,00 inclusive o frete deve ser Grátis.
    // Falha comprovada: O elemento exibe R$ 19,90 e a mensagem "Faltam R$ 0,00 para o frete grátis."
    await expect(cartPage.shippingValue).toHaveText('Grátis');
  });
});
