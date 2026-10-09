import { expect, type Locator } from '@playwright/test';
import { BasePage, escapeRegExp } from './BasePage';

/** /checkout/confirm and /checkout/finish */
export class CheckoutPage extends BasePage {
  get lineItems(): Locator {
    return this.$(`${this.s.cart.root} ${this.s.checkout.lineItem}`);
  }
  get submitButton(): Locator {
    return this.$(this.s.checkout.submitOrder).first();
  }

  async openConfirm(): Promise<void> {
    await this.goto(this.cfg.routes.checkoutConfirm);
  }

  async expectOnConfirm(): Promise<void> {
    await this.expectPath(this.cfg.routes.checkoutConfirm);
    await expect(this.submitButton).toBeVisible();
  }

  async selectPaymentMethod(label: string): Promise<void> {
    await this.selectMethod(this.$(this.s.checkout.paymentMethodLabel).filter({ hasText: new RegExp(escapeRegExp(label), 'i') }).first());
  }

  async selectShippingMethod(label: string): Promise<void> {
    await this.selectMethod(this.$(this.s.checkout.shippingMethodLabel).filter({ hasText: new RegExp(escapeRegExp(label), 'i') }).first());
  }

  /**
   * Changing payment/shipping submits a form and reloads the confirm page. Wait for the *new*
   * document (waitForLoadState would resolve on the already-loaded old one); skip if already selected.
   */
  private async selectMethod(lbl: Locator): Promise<void> {
    // Shopware's FormAutoSubmit binds after DOMContentLoaded; clicking earlier only toggles the
    // radio client-side and never POSTs /checkout/configure (order then uses the default method).
    await this.page.waitForLoadState('load');
    const { checked, id } = await lbl.evaluate((l) => {
      const input = ((l as HTMLLabelElement).htmlFor && document.getElementById((l as HTMLLabelElement).htmlFor)) || l.parentElement?.querySelector('input');
      return { checked: !!(input as HTMLInputElement | null)?.checked, id: input?.id ?? '' };
    });
    if (checked) return;
    await Promise.all([this.page.waitForEvent('domcontentloaded'), lbl.click()]);
    // Re-resolved on the reloaded document → verifies the selection was persisted server-side.
    if (id) await expect(this.page.locator(`[id="${id}"]`)).toBeChecked();
  }

  async acceptTerms(): Promise<void> {
    const tos = this.$(this.s.checkout.tos).first();
    if (!(await tos.count())) return;
    // Shopware JS can re-render the confirm page right after load and drop the
    // checked state → wait for load and retry until the checkbox stays checked.
    await this.page.waitForLoadState('load');
    await expect(async () => {
      if (!(await tos.isChecked())) await tos.check();
      await expect(tos).toBeChecked({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  }

  /** Accepts TOS, applies configured payment/shipping, places the order. Returns the order number if shown. */
  async placeOrder(): Promise<string | undefined> {
    const { paymentMethod, shippingMethod } = this.cfg.testData;
    if (shippingMethod) await this.selectShippingMethod(shippingMethod);
    if (paymentMethod) await this.selectPaymentMethod(paymentMethod);
    await this.acceptTerms();
    await Promise.all([
      // domcontentloaded: the finish page's full "load" can hang on slow third-party assets
      this.page.waitForURL(new RegExp(escapeRegExp(this.cfg.routes.checkoutFinish)), { timeout: 45_000, waitUntil: 'domcontentloaded' }),
      this.submitButton.click(),
    ]);
    const nr = this.$(this.s.checkout.finishOrderNumber).first();
    return (await nr.count()) ? (await nr.innerText()).replace(/\D+/g, ' ').trim().split(' ').pop() : undefined;
  }

  get finishHeader(): Locator {
    return this.$(this.s.checkout.finishHeader).first();
  }
}
