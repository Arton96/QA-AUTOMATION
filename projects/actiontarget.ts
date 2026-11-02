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
      // labels as rendered in the live main navigation ("and", not "&")
      'SHOOTING TARGETS',
      'TARGET BACKERS AND HANGERS',
      'STEEL TARGETS',
      'SHOOTING RANGE SUPPLIES & EQUIPMENT',
    ],

      listingCategoryPath: '/plastic-and-rubber-targets',

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

    checkoutEdgeCases: {
      // storefront minimum order quantity is 25
      product: {
        path: '/5-bull-s-eye-targets-w-orange-centers-530-OC',
        productNumber: '530-OC',
        name: "5 Bull's-Eye Targets w/ Orange Centers",
        quantity: 25,
      },

      // US-50 baseline (Ohio); street is any valid non-PO-box address
      baselineAddress: {
        street: '100 E Broad St',
        zipcode: '43215',
        city: 'Columbus',
        phone: '614-555-0100',
        countryIso: 'US',
        countryLabel: 'United States of America',
        stateLabel: 'Ohio',
      },

      baselineShippingMethod: 'UPS GROUND',
      baselinePaymentMethod: 'EBizCharge Credit Card',

      // UPS 2ND DAY AIR is allowed but not offered on staging
      allowedUpsMethods: [
        'UPS GROUND',
        'UPS 2ND DAY AIR',
        'UPS 2ND DAY AIR AM',
        'UPS 3 DAY AIR',
        'UPS OVERNIGHT AM',
        'UPS NEXT DAY AIR SAVER',
      ],

      canadaAddress: {
        street: '290 Bremner Blvd',
        zipcode: 'M5V 2T6',
        city: 'Toronto',
        phone: '416-555-0100',
        countryIso: 'CA',
        countryLabel: 'Canada',
        stateLabel: 'Ontario',
      },
      willContactShippingMethod: 'Will Contact',
      canadaPaymentMethods: ['EBizCharge Credit Card', 'Wire Transfer'],
      onAccountPaymentMethod: 'On Account',

      // staging models Puerto Rico as its own country (no states), not as a US state
      puertoRicoAddress: {
        street: '151 Calle San Francisco',
        zipcode: '00901',
        city: 'San Juan',
        phone: '787-555-0100',
        countryIso: 'PR',
        countryLabel: 'Puerto Rico',
      },

      // state option is labelled "Armed Forces Pacific" (no "AP" suffix)
      apoAddress: {
        street: 'PSC 123 Box 456',
        zipcode: '96522',
        city: 'APO',
        phone: '614-555-0100',
        countryIso: 'US',
        countryLabel: 'United States of America',
        stateLabel: 'Armed Forces Pacific',
      },

      alaskaAddress: {
        street: '632 W 6th Ave',
        zipcode: '99501',
        city: 'Anchorage',
        phone: '907-555-0100',
        countryIso: 'US',
        countryLabel: 'United States of America',
        stateLabel: 'Alaska',
      },

      hawaiiAddress: {
        street: '1001 Bishop St',
        zipcode: '96813',
        city: 'Honolulu',
        phone: '808-555-0100',
        countryIso: 'US',
        countryLabel: 'United States of America',
        stateLabel: 'Hawaii',
      },

      // Staging: CU is not assigned to the sales channel (absent from the selector); the others
      // are selectable but checkout shows blockedShippingMessage, no shipping methods, no submit.
      blockedCountries: [
        { street: '1 Test Street', phone: '+10000000000', zipcode: '101000', city: 'Moscow', countryIso: 'RU', countryLabel: 'Russian Federation', blockedBy: 'checkout' },
        { street: '1 Test Street', phone: '+10000000000', zipcode: '1010', city: 'Caracas', countryIso: 'VE', countryLabel: 'Venezuela (Bolivarian Republic of)', blockedBy: 'checkout' },
        { street: '1 Test Street', phone: '+10000000000', zipcode: '10400', city: 'Havana', countryIso: 'CU', countryLabel: 'Cuba', blockedBy: 'absent' },
        { street: '1 Test Street', phone: '+10000000000', zipcode: '1136956111', city: 'Tehran', countryIso: 'IR', countryLabel: 'Iran (Islamic Republic of)', blockedBy: 'checkout' },
        { street: '1 Test Street', phone: '+10000000000', zipcode: '00000', city: 'Pyongyang', countryIso: 'KP', countryLabel: "Korea (Democratic People's Republic of)", blockedBy: 'checkout' },
        { street: '1 Test Street', phone: '+10000000000', zipcode: '00000', city: 'Damascus', countryIso: 'SY', countryLabel: 'Syrian Arab Republic', blockedBy: 'checkout' },
      ],
      blockedShippingMessage: 'We are unable to ship to this destination.',
      wireTransferPaymentMethod: 'Wire Transfer',

      ukAddress: {
        street: '10 Test Lane',
        zipcode: 'SW1A 1AA',
        city: 'London',
        phone: '+442000000000',
        countryIso: 'GB',
        countryLabel: 'United Kingdom',
      },

      // order/invoice come from ACT_INVOICED_ORDER_NUMBER / ACT_INVOICED_INVOICE_NUMBER — the brief's
      // V0001DH / 0645384 does not belong to the configured B2C customer, so there is no fallback
      invoicedOrder: { status: 'Done' },
    },
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
  account: {
    // order overview lists the latest orders only; older ones are found via "Search by order or invoice number"
    orderSearchInput: '#orderSearchInput',
    orderSearchSubmit: '.account-orders-filter__search-submit',
    orderList: '.account-orders-main',
  },
  checkout: {
    // EBizCharge plugin (ebiz-charge-shopware.js): saved-card checkout block + saved-method selects
    savedPaymentMethod: '[data-ebiz-saved-card-checkout], [data-ebiz-saved-method-select], [data-ebiz-payment-select]',
    // EmbeddedCheckoutPlugin unhides the frame wrap only after form-url succeeded and the iframe got its src
    // (error keeps it hidden and shows data-text-error in [data-ebiz-embedded-status])
    paymentFormReady: '[data-ebiz-embedded-frame-wrap]:not([hidden]) [data-ebiz-embedded-frame][src^="http"]',
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