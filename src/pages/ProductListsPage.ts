import { expect, type Locator } from '@playwright/test';
import { BasePage, escapeRegExp } from './BasePage';

/**
 * Customer "product lists" (My Lists) — a theme/plugin feature replacing the wishlist for
 * logged-in customers (features.productListsForCustomers). Selectors: selectors.productLists.
 */
export class ProductListsPage extends BasePage {
  private get p() {
    return this.s.productLists;
  }

  /** On the PDP: saves the product to a new list via the "Save" modal (form submit reloads the PDP). */
  async saveToNewList(listName: string): Promise<void> {
    await this.$(this.p.saveButton).click();
    const modal = this.$(this.p.modal);
    await expect(modal).toBeVisible();
    await modal.locator(this.p.newListName).fill(listName);
    await Promise.all([this.page.waitForEvent('domcontentloaded'), modal.locator(this.p.submit).click()]);
    await expect(this.$(this.p.success).first()).toBeVisible();
  }

  async open(): Promise<void> {
    await this.goto(this.cfg.routes.productLists!);
    await expect(this.$(this.p.overview).first()).toBeVisible();
  }

  /** List card on the overview, matched by its exact name. */
  listCard(listName: string): Locator {
    return this.$(this.p.listCard).filter({
      has: this.page.locator(this.p.listCardName, { hasText: new RegExp(`^\\s*${escapeRegExp(listName)}\\s*$`) }),
    });
  }

  async openList(listName: string): Promise<void> {
    await this.clickAndLoad(this.listCard(listName).first());
    await expect(this.$(`${this.p.detail} ${this.p.detailTitle}`).first()).toContainText(listName);
  }

  /** Item on the list detail page, matched by product name. */
  item(productName: string): Locator {
    return this.$(this.p.item).filter({ has: this.page.locator(this.p.itemName, { hasText: productName }) });
  }

  /** On the list detail page: deletes the current list via its confirm modal. */
  async deleteCurrentList(): Promise<void> {
    await this.$(this.p.deleteTrigger).first().click();
    await Promise.all([this.page.waitForEvent('domcontentloaded'), this.$(this.p.deleteConfirm).first().click()]);
  }

  /** Overview no longer lists `listName` (the overview panel is absent in the empty state, so don't wait for it). */
  async expectListGone(listName: string): Promise<void> {
    await this.goto(this.cfg.routes.productLists!);
    await this.expectPath(this.cfg.routes.productLists!);
    await expect(this.listCard(listName)).toHaveCount(0);
  }
}
