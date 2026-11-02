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

  /** Visible error alerts (flash messages / cart errors) on the checkout page. */
  get errorAlerts(): Locator {
    return this.$(this.s.page.alertDanger).locator('visible=true');
  }

  /** Shipping/billing address blocks on the confirm page. */
  get addresses(): Locator {
    return this.$(this.s.checkout.address);
  }

  /** Saved-card UI of the payment plugin (empty selector = project has none configured). */
  get savedPaymentMethodUi(): Locator {
    return this.$(this.s.checkout.savedPaymentMethod);
  }

  /** Waits until the payment plugin's embedded form has initialised and its iframe document loaded (no-op without a selector). */
  async expectPaymentFormReady(): Promise<void> {
    if (!this.s.checkout.paymentFormReady) return;
    const ready = this.$(this.s.checkout.paymentFormReady).first();
    // the plugin fetches the form URL from an external payment provider
    await expect(ready).toBeVisible({ timeout: 30_000 });
    await (await (await ready.elementHandle())?.contentFrame())?.waitForLoadState('load');
  }

  /**
   * Opens the confirm page with the configured payment/shipping applied — the default payment
   * method can be a plugin (e.g. EBizCharge) that hides the native submit button.
   */
  async openConfirm(): Promise<void> {
    await this.goto(this.cfg.routes.checkoutConfirm);
    await this.selectConfiguredMethods();
  }

  async selectConfiguredMethods(): Promise<void> {
    const { paymentMethod, shippingMethod } = this.cfg.testData;
    if (shippingMethod) await this.selectShippingMethod(shippingMethod);
    if (paymentMethod) await this.selectPaymentMethod(paymentMethod);
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

  /** Names of all visible shipping methods on the confirm page (whitespace-normalised). */
  async shippingMethodLabels(): Promise<string[]> {
    return this.methodNames(this.s.checkout.shippingMethodLabel, this.s.checkout.shippingMethodName);
  }

  /** Names of all visible payment methods on the confirm page (whitespace-normalised). */
  async paymentMethodLabels(): Promise<string[]> {
    return this.methodNames(this.s.checkout.paymentMethodLabel, this.s.checkout.paymentMethodName);
  }

  private async methodNames(label: string, name: string): Promise<string[]> {
    // textContent (not innerText) so CSS text-transform doesn't alter the names
    const texts = await this.$(`${label} ${name}`).locator('visible=true').allTextContents();
    return texts.map((t) => t.replace(/\s+/g, ' ').trim());
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
    await this.selectConfiguredMethods();
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
