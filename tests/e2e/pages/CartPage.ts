import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CartPage extends BasePage {
  readonly couponInput: Locator;
  readonly applyCouponButton: Locator;
  readonly removeCouponButton: Locator;
  readonly couponMessage: Locator;
  readonly appliedCouponNotice: Locator;
  readonly subtotalValue: Locator;
  readonly discountValue: Locator;
  readonly shippingValue: Locator;
  readonly totalValue: Locator;
  readonly shippingNotice: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.couponInput = page.locator('#campo-cupom');
    this.applyCouponButton = page.getByRole('button', { name: 'Aplicar cupom' });
    this.removeCouponButton = page.getByRole('button', { name: 'Remover cupom' });
    this.couponMessage = page.locator('#mensagem-cupom');
    this.appliedCouponNotice = page.locator('div.cupom-aplicado');
    this.subtotalValue = page.locator('dd[data-valor="subtotal"]');
    this.discountValue = page.locator('dd[data-valor="desconto"]');
    this.shippingValue = page.locator('dd[data-valor="frete"]');
    this.totalValue = page.locator('dd[data-valor="total"]');
    this.shippingNotice = page.locator('p.aviso-frete');
    this.checkoutButton = page.getByRole('link', { name: 'Finalizar compra' });
  }

  async navigate() {
    await this.page.goto('/carrinho');
  }

  async applyCoupon(code: string) {
    await this.couponInput.fill(code);
    await this.applyCouponButton.click();
  }

  async removeCoupon() {
    await this.removeCouponButton.click();
  }

  async increaseItemQuantity(productName: string) {
    const increaseBtn = this.page.locator(`button[aria-label="Aumentar quantidade de ${productName}"]`);
    await increaseBtn.click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForURL('**/checkout');
  }
}
