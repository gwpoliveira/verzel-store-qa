import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CheckoutPage extends BasePage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly cepInput: Locator;
  readonly submitOrderButton: Locator;
  readonly subtotalValue: Locator;
  readonly discountValue: Locator;
  readonly shippingValue: Locator;
  readonly totalValue: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#campo-nome');
    this.emailInput = page.locator('#campo-email');
    this.cepInput = page.locator('#campo-cep');
    this.submitOrderButton = page.getByRole('button', { name: 'Confirmar pedido' });
    this.subtotalValue = page.locator('dd[data-valor="subtotal"]');
    this.discountValue = page.locator('dd[data-valor="desconto"]');
    this.shippingValue = page.locator('dd[data-valor="frete"]');
    this.totalValue = page.locator('dd[data-valor="total"]');
  }

  async fillCustomerData(data: { nome: string; email: string; cep: string }) {
    await this.nameInput.fill(data.nome);
    await this.emailInput.fill(data.email);
    await this.cepInput.fill(data.cep);
  }

  async submitOrder() {
    await this.submitOrderButton.click();
  }
}
