import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('nav a.link-carrinho');
    this.cartCounter = page.locator('span.contador-carrinho');
  }

  async goToCart() {
    await this.cartLink.click();
    await this.page.waitForURL('**/carrinho');
  }
}
