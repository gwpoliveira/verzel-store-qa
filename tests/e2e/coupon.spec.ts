import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage.js';
import { CartPage } from './pages/CartPage.js';

test.describe('Funcionalidade: Cupons de Desconto (Card VZS-142)', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);

    // Adiciona o produto P005 (Mochila Urbana 20L - R$ 100,00)
    await productsPage.navigate();
    await productsPage.addProductToCart('Mochila Urbana 20L');
    await productsPage.goToCart();
  });

  test('CT01 - Deve aplicar com sucesso o cupom válido BEMVINDO10 (10% desconto)', async () => {
    // Subtotal inicial: R$ 100,00
    await expect(cartPage.subtotalValue).toHaveText('R$ 100,00');

    await cartPage.applyCoupon('BEMVINDO10');

    // Valida mensagem de feedback e exibição do cupom aplicado
    await expect(cartPage.appliedCouponNotice).toContainText('Cupom BEMVINDO10 aplicado.');
    await expect(cartPage.removeCouponButton).toBeVisible();

    // Desconto de 10% sobre R$ 100,00 = - R$ 10,00
    await expect(cartPage.discountValue).toHaveText('- R$ 10,00');

    // Frete fixo = R$ 19,90 | Total = 100 - 10 + 19.90 = R$ 109,90
    await expect(cartPage.shippingValue).toHaveText('R$ 19,90');
    await expect(cartPage.totalValue).toHaveText('R$ 109,90');
  });

  test('CT02 & CT03 - Deve aceitar cupom em minúsculas e com espaços (Case-Insensitive & Trim)', async () => {
    await cartPage.applyCoupon('   bemvindo10   ');

    await expect(cartPage.appliedCouponNotice).toContainText('Cupom BEMVINDO10 aplicado.');
    await expect(cartPage.discountValue).toHaveText('- R$ 10,00');
  });

  test('CT04 - Deve rejeitar cupom inexistente com mensagem adequada', async () => {
    await cartPage.applyCoupon('CUPOMFALSO999');

    await expect(cartPage.couponMessage).toHaveText('Cupom inválido.');
    await expect(cartPage.discountValue).toHaveText('R$ 0,00');
    await expect(cartPage.totalValue).toHaveText('R$ 119,90');
  });

  test('CT05 - Deve rejeitar cupom expirado VERAO2026', async () => {
    await cartPage.applyCoupon('VERAO2026');

    await expect(cartPage.couponMessage).toHaveText('Cupom expirado.');
    await expect(cartPage.discountValue).toHaveText('R$ 0,00');
    await expect(cartPage.totalValue).toHaveText('R$ 119,90');
  });

  test('CT07 - Deve permitir remover o cupom ativo e recalcular o total', async () => {
    await cartPage.applyCoupon('BEMVINDO10');
    await expect(cartPage.discountValue).toHaveText('- R$ 10,00');

    // Remove o cupom
    await cartPage.removeCoupon();

    await expect(cartPage.discountValue).toHaveText('R$ 0,00');
    await expect(cartPage.totalValue).toHaveText('R$ 119,90');
    await expect(cartPage.couponInput).toBeVisible();
  });
});
