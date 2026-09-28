import { test, expect } from '../../src/fixtures';

/**
 * Runs once before all tests. Fails fast (with a clear message) when the
 * shop is down, behind unexpected auth, or in maintenance mode.
 */
test('storefront is reachable', async ({ page, cfg }) => {
  const response = await page.goto('/');

  expect(
    response,
    `GET ${cfg.baseURL}/ returned no response`
  ).not.toBeNull();

  expect(
    response!.status(),
    `GET ${cfg.baseURL}/ returned ${response!.status()} — shop down, maintenance mode or basic auth missing?`
  ).toBe(200);

  await expect(page.locator('body')).toHaveClass(/is-ctl-/);
});

test('API access for test data setup', async ({ cfg, adminApi, storeApi }) => {
  if (!adminApi) {
    test.info().annotations.push({
      type: 'warning',
      description: 'No Admin API credentials — customers are registered via UI and not cleaned up.',
    });
  }
  if (!storeApi) {
    test.info().annotations.push({
      type: 'warning',
      description: 'No Store API access key — cart/customer setup falls back to slower UI flows.',
    });
    return;
  }
  // Smoke-check the Store API with the configured product
  const id = await storeApi.productIdByNumber(cfg.testData.simpleProduct.productNumber);
  expect(id).toMatch(/^[0-9a-f]{32}$/);
});
