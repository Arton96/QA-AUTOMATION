import type { ProjectConfig } from '../src/config/types';

const config: ProjectConfig = {
  name: 'Action Target',

  baseURL: 'https://actiontarget-staging2.webscale.support',

  locale: 'en-US',

  currencySymbol: '$',

  features: {
    wishlist: true, // verified: data-add-to-wishlist buttons, .header-wishlist, /wishlist (is-ctl-wishlist)
    wishlistForCustomers: false, // logged-in customers get ActionTarget "My Lists" (product-lists) instead
    productListsForCustomers: true, // verified: PDP "Save" → modal → /account/product-lists
    guestCheckout: true,
    registration: true,
    doubleOptInRegistration: false, // TODO verify
    productReviews: true,
    productTaxInfo: false,
    productDeliveryInfo: false,
    contactForm: true, // TODO verify
    newsletter: true, // verified: footer form[action="/form/newsletter"]
    promotionCodes: true,
    cartAutoOpensAfterAdd: false,
    cookieBanner: false,
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
    productLists: '/account/product-lists',

    // Footer "Contact Us" (/contact-us) has no form; the Shopware contact form lives on this CMS page
    contactPage: '/page/cms/019bea8fc56971338b6124a8f036af66',
  },

  testData: {
    mainCategories: [
      'SHOOTING TARGETS',
      'TARGET BACKERS & HANGERS',
      'TARGET STANDS & SYSTEMS',
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

    searchNoResultTerm: 'zzqxvwjkqpxz',

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
        phone: '+590 690 00 00 00',
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

    promotionCode: 'E2E-AUTOMATION-10',
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
   cart: {
    summaryTotal: 'dd.checkout-aside-summary-total-custom',
  },
  page: {
    alertDanger: '.at-alert--danger',
    alertSuccess: '.at-alert--success',
  },
  search: {
    emptyAlert: '.cms-listing-row .at-alert--warning',
  },
  wishlist: {
    // .product-wishlist-remove is a zero-size wrapper here; click the button inside it
    remove: '.product-wishlist-btn-remove',
  },
  productLists: {
    saveButton: '.pdp-wishlist-icon button.product-lists-trigger',
    modal: '.modal.show .at-product-list-modal',
    newListName: 'input[name="newListName"]',
    submit: 'button.at-product-list-form-submit',
    success: '.flashbags .at-alert--success .at-alert__message',
    overview: '.at-product-lists-panel',
    listCard: 'a.card[href^="/account/product-lists/"]',
    listCardName: 'h3',
    detail: '.at-product-lists-detail',
    detailTitle: 'h2.card-title',
    item: 'article.at-product-list-item',
    // name link is rendered twice (responsive) — use the desktop one
    itemName: '.at-product-list-item-content.d-md-block a.at-product-list-item-name',
    deleteTrigger: '[data-bs-target^="#at-product-list-delete-"]',
    deleteConfirm: '.modal.show button[type="submit"].btn-outline-danger',
  },
},
};

export default config;