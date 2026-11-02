import { expect, type Locator } from '@playwright/test';
import { BasePage, escapeRegExp } from './BasePage';

export class AccountPage extends BasePage {
  get asideItems(): Locator {
    return this.$(this.s.account.asideItem);
  }

  async open(): Promise<void> {
    await this.goto(this.cfg.routes.account);
    await this.expectPath(this.cfg.routes.account);
  }

  async openProfile(): Promise<void> {
    await this.goto(this.cfg.routes.accountProfile);
    await expect(this.$(this.s.account.profileForm)).toBeVisible();
  }

  async updateName(firstName: string, lastName: string): Promise<void> {
    await this.$(this.s.account.profileFirstName).fill(firstName);
    await this.$(this.s.account.profileLastName).fill(lastName);
    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.$(this.s.account.profileSubmit).first().click(),
    ]);
  }

  async openAddresses(): Promise<void> {
    await this.goto(this.cfg.routes.accountAddresses);
    await this.expectPath(this.cfg.routes.accountAddresses);
  }

  async openOrders(): Promise<void> {
    await this.goto(this.cfg.routes.accountOrders);
    await this.expectPath(this.cfg.routes.accountOrders);
  }

  get orders(): Locator {
    return this.$(this.s.account.orderItem);
  }

  /** Filters the order overview via its search (no-op when the project has no order search). */
  async searchOrders(term: string): Promise<void> {
    if (!this.s.account.orderSearchInput) return;
    await this.$(this.s.account.orderSearchInput).fill(term);
    // exact URL: third-party beacons (e.g. New Relic) carry /account/order in their query string
    const url = new RegExp(`^${escapeRegExp(this.cfg.baseURL + this.cfg.routes.accountOrders)}(\\?.*)?$`);
    await this.waitForXhr(url, () => this.$(this.s.account.orderSearchSubmit).first().click());
    await expect(this.$(this.s.account.orderList).first()).not.toHaveClass(/has-element-loader/);
  }

  orderStatus(orderNumber: string): Locator {
    return this.orderRow(orderNumber).locator(this.s.account.orderStatus).first();
  }

  orderRow(orderNumber: string): Locator {
    return this.orders.filter({ hasText: orderNumber }).first();
  }

  /** Expands the order's detail section (read-only collapse toggle). */
  async openOrderDetails(orderNumber: string): Promise<void> {
    const toggle = this.orderRow(orderNumber).locator(this.s.account.orderDetailToggle).first();
    if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) !== 'true') await toggle.click();
  }

  /** Cancel controls of the order (inside its row incl. context menu). Never click — inspect only. */
  orderCancelControls(orderNumber: string): Locator {
    return this.orderRow(orderNumber).locator(this.s.account.orderCancel);
  }

  get successAlert(): Locator {
    return this.$(this.s.page.alertSuccess).first();
  }

  async logout(): Promise<void> {
    await this.goto(this.cfg.routes.logout);
  }
}
