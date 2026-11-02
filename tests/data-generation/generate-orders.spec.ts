import { test, expect, skipUnless } from '../../src/fixtures';
import { buildCustomer } from '../../src/data/customer';

const ORDER_COUNT = Number(process.env.ORDER_GENERATION_COUNT ?? 1);

const EBIZ_TEST_CARD_NUMBER = process.env.EBIZ_TEST_CARD_NUMBER;
const EBIZ_TEST_EXP_MONTH = process.env.EBIZ_TEST_EXP_MONTH;
const EBIZ_TEST_EXP_YEAR = process.env.EBIZ_TEST_EXP_YEAR;
const EBIZ_TEST_CVV = process.env.EBIZ_TEST_CVV;

if (!Number.isInteger(ORDER_COUNT) || ORDER_COUNT <= 0) {
  throw new Error(
    `ORDER_GENERATION_COUNT must be a positive integer. Received: ${ORDER_COUNT}`
  );
}

function requireEnv(
  name: string,
  value: string | undefined
): string {
  if (!value) {
    throw new Error(`${name} is missing from .env`);
  }

  return value;
}

test.describe.configure({ mode: 'serial' });

test.describe('Generate EBizCharge test orders @data-generation', () => {
  for (let i = 1; i <= ORDER_COUNT; i++) {
    test(`create EBizCharge order ${i}/${ORDER_COUNT}`, async ({
      page,
      cfg,
      cart,
      cartHelper,
      auth,
      checkout,
      requireWriteAccess,
    }) => {
      test.setTimeout(120_000);

      void requireWriteAccess;

      skipUnless(cfg.features.guestCheckout, 'guestCheckout');

      const cardNumber = requireEnv(
        'EBIZ_TEST_CARD_NUMBER',
        EBIZ_TEST_CARD_NUMBER
      );

      const expMonth = requireEnv(
        'EBIZ_TEST_EXP_MONTH',
        EBIZ_TEST_EXP_MONTH
      );

      const expYear = requireEnv(
        'EBIZ_TEST_EXP_YEAR',
        EBIZ_TEST_EXP_YEAR
      );

      const cvv = requireEnv(
        'EBIZ_TEST_CVV',
        EBIZ_TEST_CVV
      );

      const orderIndex = String(i).padStart(4, '0');

      console.log('\n--------------------------------');
      console.log(`Creating order ${orderIndex}/${ORDER_COUNT}`);
      console.log('Payment: EBizCharge');
      console.log('Shipping: Will Contact');
      console.log('--------------------------------');

      // 1. Add product
      await cartHelper.add(cfg.testData.simpleProduct);

      // 2. Open cart
      await cart.open();

      // 3. Proceed to checkout
      await cart.proceedToCheckout();

      await expect(page).toHaveURL(
        new RegExp(cfg.routes.checkoutRegister)
      );

      // 4. Guest registration
      const customer = buildCustomer(cfg);

      await auth.register(customer, {
        guest: true,
      });

      // 5. Confirm page
      await checkout.expectOnConfirm();

      await expect(
        checkout.lineItems.filter({
          hasText: cfg.testData.simpleProduct.name,
        })
      ).toHaveCount(1);

      // 6. Shipping
      await checkout.selectShippingMethod('Will Contact');

      // 7. Payment
      await checkout.selectPaymentMethod('EBizCharge');

      // 8. Shopware terms
      await checkout.acceptTerms();

      console.log(
        `Order ${orderIndex}: EBizCharge selected`
      );

      // 9. Submit Shopware checkout and wait for EBizCharge
      await Promise.all([
        page.waitForURL(/ebizcharge/i, {
          timeout: 45_000,
          waitUntil: 'domcontentloaded',
        }),

        checkout.submitButton.click(),
      ]);

      console.log(
        `Order ${orderIndex}: redirected to EBizCharge`
      );

      // 10. Verify EBiz payment page
      await expect(
        page.getByText(/Secure Payment Form/i)
      ).toBeVisible({
        timeout: 30_000,
      });

      // 11. Name as on Card
      const nameOnCard = page.getByRole('textbox', {
        name: /Name as on Card/i,
      });

      await expect(nameOnCard).toBeVisible();

      const currentName = await nameOnCard.inputValue();

      if (!currentName.trim()) {
        await nameOnCard.fill('QA Tester');
      }

      // 12. Card Number
      const cardNumberInput = page.getByRole('spinbutton', {
        name: /Card Number/i,
      });

      await expect(cardNumberInput).toBeVisible();

      await cardNumberInput.fill(cardNumber);

      // 13. Expiration Month / Year
      //
      // EBiz renders these as custom controls, not normal <select> elements.
      // We use the visible textboxes directly.
      // 13. Expiration Month / Year
//
// EBiz uses Telerik RadComboBox controls.
// The visible inputs are readonly, so we must open
// the dropdown and select the value like a real user.

const monthInput = page.locator('#dropDownMonth_Input');
const yearInput = page.locator('#dropDownYear_Input');

await expect(monthInput).toBeVisible();
await expect(yearInput).toBeVisible();

// Month
await monthInput.click();

const monthOption = page
  .locator('.rcbItem:visible')
  .filter({
    hasText: new RegExp(`^${expMonth}$`),
  })
  .first();

await expect(monthOption).toBeVisible();
await monthOption.click();

// Year
await yearInput.click();

const yearOption = page
  .locator('.rcbItem:visible')
  .filter({
    hasText: new RegExp(`^${expYear}$`),
  })
  .first();

await expect(yearOption).toBeVisible();
await yearOption.click();

// Verify selection
await expect(monthInput).toHaveValue(expMonth);
await expect(yearInput).toHaveValue(expYear);

      // 14. Security Code
      const cvvInput = page.getByRole('spinbutton', {
        name: /Security Code/i,
      });

      await expect(cvvInput).toBeVisible();

      await cvvInput.fill(cvv);

      // 15. EBiz terms
      const ebizTerms = page.getByRole('checkbox', {
        name: /I've read and agree/i,
      });

      await expect(ebizTerms).toBeVisible();

      await ebizTerms.check();

      await expect(ebizTerms).toBeChecked();

      console.log(
        `Order ${orderIndex}: payment form completed`
      );

      // 16. Pay
      const payNowButton = page.getByRole('button', {
        name: /Pay Now/i,
      });

      await expect(payNowButton).toBeVisible();

      await payNowButton.click();

      console.log(
        `Order ${orderIndex}: payment submitted`
      );

      // 17. Wait for redirect back to Shopware
      await page.waitForURL(
        new RegExp(cfg.routes.checkoutFinish),
        {
          timeout: 60_000,
          waitUntil: 'domcontentloaded',
        }
      );

      // 18. Verify finish page
      await expect(page.locator('body')).toHaveClass(
        /is-act-finishpage/
      );

      await expect(
        checkout.finishHeader
      ).toBeVisible();

      console.log(
        `✅ Order ${orderIndex}/${ORDER_COUNT} created successfully`
      );
    });
  }
});