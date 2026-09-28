import type { ProjectConfig } from '../src/config/types';

const config: ProjectConfig = {
  name: 'Action Target',

  baseURL: 'https://actiontarget-staging2.webscale.support',

  locale: 'en-US',

  currencySymbol: '$',

  features: {
    wishlist: false, // TODO verify
    guestCheckout: true,
    registration: true,
    doubleOptInRegistration: false, // TODO verify
    productReviews: true,
    productTaxInfo: false,
    productDeliveryInfo: false,
    contactForm: true, // TODO verify
    newsletter: false, // TODO verify
    promotionCodes: true,
    cookieBanner: true,
    languageSwitch: false, // TODO verify
    currencySwitch: false, // TODO verify
    mobileNavigation: true,
  },

  routes: {
    home: '/',
    login: '/account/login',
    register: '/account/register',
    account: '/account',
    accountProfile: '/account/profile',
    accountAddresses: '/account/address',
    accountOrders: '/account/order',
    logout: '/account/logout',

    cart: '/checkout/cart',
    checkoutRegister: '/checkout/register',
    checkoutConfirm: '/checkout/confirm',
    checkoutFinish: '/checkout/finish',

    search: '/search',
    wishlist: '/wishlist',

    contactPage: null,
  },

  testData: {
    mainCategories: [
      'DEMO CATEGORY',
      'SHOOTING TARGETS',
      'TARGET BACKERS AND HANGERS',
      'SHOOTING RANGE SUPPLIES & EQUIPMENT',
    ],

    listingCategoryPath: '/paper-and-cardboard-targets',

    simpleProduct: {
      path: '/tactical-grit-gsr-x-out-hand-wash-3.3-oz-tube-0022-GSR-X-OUT-TB',
      productNumber: '0022-GSR-X-OUT-TB',
      name: 'Tactical Grit - GSR X-Out Hand Wash - 3.3 oz Tube',
    },

    variantProduct: {
      path: '/pt-ranger-ac-zone-ar550-RANGER-AC',
      productNumber: 'RANGER-AC',
      name: 'PT Ranger AC Zone (AR550)',
      optionGroups: ['Headplate', 'Stand Height', 'Steel Type'],
      switchGroupIndex: 0,
    },

    searchTerm: 'Tactical Grit',

    searchMinResults: 1,

    searchNoResultTerm: 'zzqx-no-such-product-4711',

    expectedFilterTypes: [
      'manufacturer',
      'properties',
      'price',
    ],

    expectedSortings: [
      'name-asc',
      'name-desc',
      'price-asc',
      'price-desc',
    ],

    customer: {
      emailDomain: 'example.com',
      emailPrefix: 'actiontarget-e2e',
      password: 'Shopware-E2E-2026!',
      firstName: 'QA',
      lastName: 'Tester',
      salutationIndex: 1,

      address: {
        street: 'test123',
        zipcode: '11000',
        city: 'Test',
        countryIso: 'GP',
        countryLabel: 'Guadeloupe',
      },
    },

    contactLinkText: /Contact/i,

    // Important:
    // Prefer an offline method so checkout can finish
    // without redirecting to EBizCharge.
    paymentMethod: 'Wire Transfer',

    shippingMethod: 'Will Contact',

    promotionCode: null,
  },

  redirects: [
    {
      from: '/account',
      to: '/account/login',
    },

    {
      from: '/checkout/confirm',
      to: '/checkout/cart',
    },
  ],

  importantLinks: [
    '/',
    '/checkout/cart',
    '/account/login',
    '/sitemap.xml',
    '/robots.txt',
  ],

  selectors: {
  header: {
    logo: '.header-logo-main-link:visible',
  },
   product: {
    name: 'h1.product-title',
    price: '[data-at-price-current]',
    buyButton: 'button[aria-label="Add to shopping cart"]',
   },
},
};

export default config;