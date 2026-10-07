import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/ProductsPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { ConfirmationPage } from './pages/ConfirmationPage.js';

test.describe('Funcionalidade: Checkout e Confirmação de Pedido (E2E)', () => {
  let productsPage: ProductsPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;
  let confirmationPage: ConfirmationPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    confirmationPage = new ConfirmationPage(page);

    await productsPage.navigate();
  });

  test('CT18 - Jornada completa de compra: Vitrine -> Carrinho com Cupom -> Checkout -> Confirmação', async ({ page }) => {
    // 1. Vitrine: Adiciona Mochila Urbana 20L (R$ 100,00)
    await productsPage.addProductToCart('Mochila Urbana 20L');
    await productsPage.goToCart();

    // 2. Carrinho: Aplica cupom BEMVINDO10
    await cartPage.applyCoupon('BEMVINDO10');
    await expect(cartPage.discountValue).toHaveText('- R$ 10,00');

    // 3. Procede para Checkout
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*checkout/);

    // Valida que o resumo transitou corretamente para a tela de checkout
    await expect(checkoutPage.subtotalValue).toHaveText('R$ 100,00');
    await expect(checkoutPage.discountValue).toHaveText('- R$ 10,00');
    await expect(checkoutPage.shippingValue).toHaveText('R$ 19,90');
    await expect(checkoutPage.totalValue).toHaveText('R$ 109,90');

    // 4. Preenche formulário de cliente
    await checkoutPage.fillCustomerData({
      nome: 'Carlos Eduardo Santos',
      email: 'carlos.santos@exemplo.com',
      cep: '01310-100',
    });

    // 5. Finaliza o pedido
    await checkoutPage.submitOrder();

    // 6. Confirmação
    await expect(page).toHaveURL(/.*pedido-confirmado/);
    await expect(confirmationPage.confirmationHeading).toHaveText(/^Pedido VZ-\d{6}$/);

    // 7. Garante que o contador de carrinho foi esvaziado
    await expect(productsPage.cartCounter).toHaveText('0');
  });

  test('CT19 - Validação defensiva de dados do cliente no checkout', async ({ page }) => {
    await productsPage.addProductToCart('Camiseta Essencial');
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();

    // Tenta submeter com dados inválidos (apenas primeiro nome, email sem @, cep incompleto)
    await checkoutPage.fillCustomerData({
      nome: 'Carlos', // precisa sobrenome
      email: 'emailinvalido',
      cep: '1234',
    });

    await checkoutPage.submitOrder();

    // Permanece na página de checkout
    await expect(page).toHaveURL(/.*checkout/);

    // Valida mensagens de erro inline
    await expect(page.locator('text=Informe nome e sobrenome.')).toBeVisible();
    await expect(page.locator('text=Informe um e-mail válido.')).toBeVisible();
    await expect(page.locator('text=Informe um CEP com 8 dígitos.')).toBeVisible();
  });
});
