# ActionTarget Checkout Edge Cases — QA Report (Part A)

| | |
|---|---|
| Spec | `tests/client/actiontarget-checkout-edge-cases.spec.ts` |
| Environment | ActionTarget staging (`PROJECT=actiontarget`) |
| Browser / workers | Chromium (Desktop Chrome), `--workers=1` |
| Run date | 2026-10-22 |
| HTML report (evidence) | `playwright-report/index.html` (open with `npx playwright show-report`) |
| Branch | `qa-updates` (uncommitted) |

## 1. Executive Summary

| Metric | Count |
|---|---|
| Edge-case tests (A-00 … A-14, incl. a/b variants and 6× A-05) | **25** |
| Passed | **24** |
| Failed | **0** |
| BLOCKED (skipped) | **1**: A-13, no test data (no evidence produced or fabricated) |

**Overall status:** 14 of 15 documented requirements (A-00 to A-12 and A-14) are automated and pass against staging. A-13 is implemented but BLOCKED: no invoiced Done order belonging to the configured B2C customer is available.

- **A-14:** the timing issue is fixed. The test waits for EBizCharge to finish initialising before it checks for saved-card UI.
- **Data generation:** isolated from all normal regression and CI runs.
- **Safety:** no destructive actions were performed. No credentials or card data are visible in any screenshot, and the B2C e-mail is masked.
- **Not done yet:** Part B has not been started, and the full storefront regression has not been run.

## 2. Scope

**In scope:** the ActionTarget checkout edge cases **A-00 to A-14** (Part A of the implementation brief):
- shipping-method rules by destination;
- blocked countries;
- payment-method rules for guests and B2C customers;
- the invoiced-order cancellation restriction;
- saved-card UI for guests.

**Not in scope:** Part B. The full storefront regression was not run.

**Read-only:** every test stops on `/checkout/confirm` (A-13: on the account order list). No test places an order, submits payment, enters card data or clicks cancel. The only data created is the guest customers that the existing guest-registration flow creates. The existing `cleanup` teardown deletes them.

## 3. Test Case Results and Evidence

Each attachment is a full-page `page.screenshot()` attached with `test.info().attach(...)`, so it appears under **Attachments** in the HTML report. The one exception is the Cuba selector list, which is attached as JSON. The global `screenshot: 'only-on-failure'` policy is unchanged.

**Naming**
- `<ID>-context-…`: who the test runs as and where it ships to.
- `<ID>-result-…`: the state the test observed.
- `<ID>-context-result-…`: one page proves both. On a guest confirm page, the address block (context) and the full payment and shipping lists (result) are on the same page.

| Test | Context | Destination | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| A-00 | Guest | Columbus, Ohio, US | UPS GROUND present; every UPS method whitelisted; EBizCharge present | UPS GROUND only; EBizCharge | PASS | `A-00-context-result-ohio-guest-ups-payment` |
| A-01 | Guest | Toronto, Ontario, Canada | No UPS; Will Contact; payment exactly EBizCharge + Wire Transfer; no On Account | Will Contact; EBizCharge + Wire Transfer | PASS | `A-01-context-result-canada-guest-will-contact-payment` |
| A-02 | Guest | San Juan, Puerto Rico | No UPS; Will Contact | Will Contact only | PASS | `A-02-context-result-puerto-rico-guest-will-contact` |
| A-03 | Guest | APO 96522, Armed Forces Pacific, US | No UPS; Will Contact | Will Contact only | PASS | `A-03-context-result-apo-guest-will-contact` |
| A-04a | Guest | Anchorage, Alaska, US | No UPS; Will Contact | Will Contact only | PASS | `A-04a-context-result-alaska-guest-will-contact` |
| A-04b | Guest | Honolulu, Hawaii, US | No UPS; Will Contact | Will Contact only | PASS | `A-04b-context-result-hawaii-guest-will-contact` |
| A-05 CU | Guest registration (no customer created) | Cuba | Cuba can't be used | Absent from the country selector | PASS | `A-05-CU-result-country-selector-options` (JSON) |
| A-05 RU | Guest | Moscow, Russian Federation | Blocked: alert, no shipping methods, no order submit | "We are unable to ship to this destination."; empty shipping; no submit | PASS | `A-05-RU-context-result-blocked-shipping-alert` |
| A-05 VE, IR, KP, SY | Guest | Caracas, Tehran, Pyongyang, Damascus | Same as RU | Same as RU | PASS ×4 | Same mechanism as RU, so no separate screenshot |
| A-06 | Logged-in B2C | Columbus, Ohio, US (default address) | EBizCharge present; Wire Transfer and On Account absent | EBizCharge only | PASS | `A-06-context-b2c-ohio`, `A-06-result-payment-methods` |
| A-07 | Guest | Columbus, Ohio, US | EBizCharge present; On Account absent | EBizCharge only | PASS | `A-07-context-result-ohio-guest-no-on-account` |
| A-08a | Guest | Columbus, Ohio, US | EBizCharge present; Wire Transfer absent | EBizCharge only | PASS | `A-08a-context-result-ohio-guest-no-wire` |
| A-08b | Guest | London, United Kingdom | Wire Transfer + EBizCharge present; On Account absent | EBizCharge + Wire Transfer | PASS | `A-08b-context-result-uk-guest-wire-payment` |
| A-09a | Guest | Columbus, Ohio, US | No payment method matching `/pay\s*by\s*link/i` | None | PASS | `A-09a-context-result-ohio-guest-no-pay-by-link` |
| A-09b | Logged-in B2C | Columbus, Ohio, US | No payment method matching `/pay\s*by\s*link/i` | None | PASS | `A-09b-context-b2c-ohio`, `A-09b-result-no-pay-by-link` |
| A-10a | Guest | Columbus, Ohio, US | No payment method matching `/\bACH\b/i` | None | PASS | `A-10a-context-result-ohio-guest-no-ach` |
| A-10b | Logged-in B2C | Columbus, Ohio, US | No payment method matching `/\bACH\b/i` | None | PASS | `A-10b-context-b2c-ohio`, `A-10b-result-no-ach` |
| A-11a | Guest | Columbus, Ohio, US | No shipping method matching `/USPS\|PREMS/i` | None (UPS GROUND only) | PASS | `A-11a-context-result-ohio-guest-no-usps` |
| A-11b | Guest | Honolulu, Hawaii, US | No shipping method matching `/USPS\|PREMS/i` | None (Will Contact only) | PASS | `A-11b-context-result-hawaii-guest-no-usps` |
| A-12 | Guest | Columbus, Ohio, US | No `/UPS\s*HOME/i`; every UPS method in the whitelist | UPS GROUND only | PASS | `A-12-context-result-ohio-guest-ups-whitelist` |
| A-13 | Logged-in B2C | n/a (account order list) | Invoiced Done order: status Done, invoice visible, no enabled cancel | Not executed | **BLOCKED** | No screenshot — test data unavailable; test BLOCKED before validation. |
| A-14 | Guest, EBizCharge selected | Columbus, Ohio, US | EBizCharge present; after the form initialises, no saved-card UI | EBizCharge form initialised; no saved-card UI | PASS | `A-14-context-result-ohio-guest-ebiz-no-saved-card` |

**One vs two screenshots**
- **Two screenshots (context + result):** A-06, A-09b and A-10b. The B2C context is the account overview after login: logged-in header, customer name, and the default billing/shipping address (Ohio), with the e-mail masked. The result is the confirm page.
- **One screenshot:** A-00 to A-04b, A-05 RU, A-07, A-08a, A-08b, A-09a, A-10a, A-11a, A-11b, A-12 and A-14.
- **JSON only:** A-05 CU.
- **No own attachment:** A-05 VE, IR, KP and SY (RU is the representative), and A-13 (BLOCKED).
- **Shared image files:** Playwright stores attachments by content hash. Identical pages therefore share one image file under different attachment names: the Ohio guest confirm page (A-00, A-07, A-08a, A-09a, A-10a, A-11a, A-12), the Hawaii page (A-04b, A-11b) and the B2C pages.

## 4. Detailed Test Case Notes

| Test | Implementation vs brief | Notes |
|---|---|---|
| A-00 | Matches | The positive anchor proves the lists loaded. `UPS 2ND DAY AIR` is whitelisted but not required, as documented; staging doesn't offer it. The street address is synthetic because the brief doesn't define one. |
| A-01 | Matches | The payment set is asserted exactly. |
| A-02 | Matches (staging representation) | Staging models Puerto Rico as its own country with no states, which the brief allowed. |
| A-03 | Matches (staging representation) | The state option is "Armed Forces Pacific", without "(AP)". |
| A-04a/b | Matches | Shipping assertions only, as instructed. |
| A-05 | Matches (staging representation) | Each country is pinned to its observed mechanism. **CU:** absent from the selector, so no customer is created. **RU, VE, IR, KP, SY:** selectable but blocked on confirm. The blocked list is admin-configurable, so a config change fails the test by design. |
| A-06 | Partial | The precondition checks that the confirm address contains "Ohio". The "without Wire opt-in" state can't be read and is assumed from the account setup. |
| A-07 – A-12 | Matches | Full visible lists, using the regexes from the brief. |
| A-13 | Implemented, not validated | **Data:** order and invoice come only from env (`ACT_INVOICED_ORDER_NUMBER`, `ACT_INVOICED_INVOICE_NUMBER`). No fallback order is used, because the order documented in the brief doesn't belong to the configured customer. **BLOCKED:** only when `ACT_INVOICED_ORDER_NUMBER` is unset. The test then skips with "BLOCKED: no valid invoiced Done order is available for the configured B2C customer", before login or any locator. **Once an order is configured:** a missing invoice number fails; an order not found by the search fails; then it asserts status Done, the invoice is visible and no cancel control is enabled. Cancel is never clicked. The order is found via the account order search, because the overview lists only the 10 most recent orders. |
| A-14 | Matches for timing; selector proven only by absence | The test asserts only after `CheckoutPage.expectPaymentFormReady()`. That waits for `[data-ebiz-embedded-frame-wrap]:not([hidden]) [data-ebiz-embedded-frame][src^="http"]` to become visible, then for the iframe's `load`. The signal is from staging's `ebiz-charge-shopware.js`: the frame wrap is unhidden only after the payment-form URL loads successfully and the "Loading secure payment form..." status is cleared. On error it stays hidden, so the test fails. |

## 5. Remaining Findings / Limitations

1. **A-13 is BLOCKED by test data.** To unblock it, set `ACT_INVOICED_ORDER_NUMBER` and `ACT_INVOICED_INVOICE_NUMBER` to an invoiced Done order of the configured B2C customer. The cancel selector (`account.orderCancel`, Shopware core default) has never been matched against a real ActionTarget cancel control. Once data exists, confirm it against a *cancellable* order.
2. **A-14 saved-card selectors are proven only by absence.** No customer with saved cards was available to confirm that `[data-ebiz-saved-card-checkout], [data-ebiz-saved-method-select], [data-ebiz-payment-select]` match real saved-card UI.
3. **A-06 Wire opt-in is assumed.** The test confirms the observable outcome but can't read the customer's opt-in flag.
4. **Evidence that can't prove an assertion on its own:**
   - **Guest vs logged-in:** the guest confirm page has no explicit "guest" marker. Guest context is established by the test flow; B2C context is shown separately on the account overview.
   - **A-05 RU:** "no order submit control" is a DOM assertion. The screenshot shows no Place Order button, but the EBizCharge plugin also hides that button on other confirm pages. The alert and the empty shipping list are the visual proof.
   - **A-05 CU:** absence is proven by the JSON option list, not an image.
   - **A-12:** the screenshot shows the UPS labels; the whitelist comparison is against the profile config.
   - **A-14:** the initialised state is visible (no loading message, frame shown), but the cross-origin EBizCharge iframe renders **blank** in the screenshot. Saved-card absence is a DOM assertion.
   - **A-06:** the opt-in state isn't visible anywhere.
   - **EBizCharge form in other screenshots:** tests other than A-14 don't wait for the embedded card form, so in their screenshots it is still initialising. Their payment-method and shipping-method lists are complete regardless.
5. **Staging observations (not asserted):** the B2C confirm page has no shipping method preselected (shipping $0.00). Blocked-country confirm pages still list EBizCharge and Wire Transfer.
6. **Add-to-cart HTTP 400:** seen twice during implementation (`/checkout/line-item/add`), both times passing on re-run. It wasn't seen in the final runs. Watch for it in CI, where `retries: 2` applies.

## 6. Architecture / Implementation Review

| Check | Status | Notes |
|---|---|---|
| Existing page objects reused | ✅ | `CheckoutPage`, `CartPage`, `AuthPage`, `AccountPage` and existing fixtures were extended; no new page objects or fixtures. |
| Selectors outside specs | ✅ | All selectors are in `src/selectors/shopware67.ts`, with ActionTarget overrides in `projects/actiontarget.ts`. Plugin-specific `savedPaymentMethod` and `paymentFormReady` have empty core defaults. |
| No fixed waits | ✅ | No `waitForTimeout` or `setTimeout`. Waits use `expect`/`expect.poll`, load states and XHR waits. |
| Credentials env-based | ✅ | `ACT_B2C_EMAIL`, `ACT_B2C_PASSWORD`, `ACT_INVOICED_ORDER_NUMBER` and `ACT_INVOICED_INVOICE_NUMBER` are read in `src/config/loader.ts` and documented in `.env.example`. Nothing is hardcoded or logged. |
| No destructive actions | ✅ | No Place Order or payment submit, no card entry, no cancel click. No Sage or business-data changes. |
| Logged-in cart cleanup | ✅ | The cart is cleared before and after each B2C test; `CartPage.clear()` verifies the cart is empty. |
| Screenshot safety | ✅ | All attachments were inspected: no passwords, tokens, card numbers or CVVs. The B2C e-mail is masked with Playwright's `mask` option. Visible personal data is limited to the QA account's display name, customer number and Ohio address, plus synthetic guest "QA Tester" addresses. |
| Order data generation isolated | ✅ | `playwright.config.ts` ignores `data-generation/**` in every project, so `npm test`, smoke, regression, `test:client` and the CI shards collect 0 generator tests (checked with `--list`). It runs only via `npm run generate:orders` (`playwright.data-generation.config.ts`: one worker, no retries). Before any such run, Order Sync to Sage must be explicitly controlled or disabled. |

## 7. Final Conclusion

**Fully automated and passing, matching the brief:**
- A-00, A-01, A-04a, A-04b, A-07, A-08a, A-08b, A-09a, A-09b, A-10a, A-10b, A-11a, A-11b, A-12.
- A-02, A-03 and A-05 (6 countries) match, using staging-specific representations approved during implementation.

**Automated and passing, with a documented limitation:**
- **A-14:** the timing issue is fixed; the saved-card selector is proven only by absence.
- **A-06:** the Wire opt-in is assumed.

**Blocked:**
- **A-13:** implemented and read-only, but not validated. No invoiced Done order of the configured B2C customer is available. There is no A-13 evidence, and none has been fabricated.
