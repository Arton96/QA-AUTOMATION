import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Order data generation only (npm run generate:orders) — places real orders with EBizCharge test cards.
 * Kept out of playwright.config.ts so smoke/regression/CI can never pick it up.
 * No retries and one worker: every attempt creates an order.
 */
export default defineConfig({
  ...base,
  testDir: './tests/data-generation',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  projects: [{ name: 'data-generation', use: { ...devices['Desktop Chrome'] } }],
});
