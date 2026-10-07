import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ProductsPage extends BasePage {
  readonly productsGrid: Locator;

  constructor(page: Page) {
    super(page);
    this.productsGrid = page.locator('section.grade-produtos');
  }

  async navigate() {
    await this.page.goto('/');
    await this.page.locator('article').first().waitFor({ state: 'visible' });
  }

  getProductCard(productName: string): Locator {
    return this.page.locator('article', { hasText: productName });
  }

  async addProductToCart(productName: string) {
    const card = this.getProductCard(productName);
    const addButton = card.getByRole('button', { name: 'Adicionar ao carrinho' });
    await addButton.click();
  }
}
