import { test, expect, skipUnless } from '../../src/fixtures';
import { ProductListsPage } from '../../src/pages/ProductListsPage';

/** Only runs when features.wishlist = true in the project profile. */
test.describe('Wishlist', () => {
  test.beforeEach(({ cfg }) => skipUnless(cfg.features.wishlist, 'wishlist'));

  test('guest can add a product to the wishlist', { tag: '@smoke' }, async ({ page, cfg, product }) => {
    await product.open(cfg.testData.simpleProduct);
    await product.addToWishlist();
    await expect(page.locator(cfg.selectors.header.wishlistBadge).first()).toContainText('1');
  });

  test('wishlist page shows added product and allows removal', async ({ page, cfg, product }) => {
    await product.open(cfg.testData.simpleProduct);
    await product.addToWishlist();
    await page.goto(cfg.routes.wishlist);
    const box = page.locator(cfg.selectors.wishlist.productBox).filter({ hasText: cfg.testData.simpleProduct.name });
    await expect(box).toBeVisible();
    await box.locator(cfg.selectors.wishlist.remove).first().click();
    await expect(box).toHaveCount(0);
  });

  test.describe('logged-in', () => {
    // Evaluated before fixtures → no customer is created/logged in when skipped
    test.skip(
      ({ cfg }) => !cfg.features.wishlistForCustomers && !cfg.features.productListsForCustomers,
      'No saved-product feature for logged-in customers (wishlistForCustomers / productListsForCustomers)',
    );

    test('logged-in saved product persists after re-login', async ({ loggedInPage: page, cfg, product, auth, account, customer }) => {
      const relogin = async () => {
        await account.logout();
        await auth.open();
        await auth.loginAndExpectSuccess(customer.email, customer.password);
      };
      const { name } = cfg.testData.simpleProduct;

      if (cfg.features.wishlistForCustomers) {
        await product.open(cfg.testData.simpleProduct);
        await product.addToWishlist();
        await relogin();
        await page.goto(cfg.routes.wishlist);
        await expect(page.locator(cfg.selectors.wishlist.productBox).filter({ hasText: name })).toBeVisible();
        return;
      }

      // Product lists ("My Lists"): save to a uniquely named new list, verify it survives re-login
      const lists = new ProductListsPage(page, cfg);
      const listName = `E2E My List ${Date.now()}`;
      await product.open(cfg.testData.simpleProduct);
      await lists.saveToNewList(listName);
      try {
        await lists.open();
        await lists.openList(listName);
        await expect(lists.item(name)).toHaveCount(1);

        await relogin();
        await lists.open();
        await lists.openList(listName);
        await expect(lists.item(name)).toHaveCount(1);
      } finally {
        // Best-effort cleanup of the created list (we are logged in on every path that created it)
        await lists.open();
        if (await lists.listCard(listName).count()) {
          await lists.openList(listName);
          await lists.deleteCurrentList();
          await lists.expectListGone(listName);
        }
      }
    });
  });
});
