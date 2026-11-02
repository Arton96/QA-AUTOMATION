import type { Selectors } from '../selectors/shopware67';

/** Deep partial helper used for project-level overrides. */
export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

/**
 * Switch storefront features on/off per client project.
 * Tests for a disabled feature are skipped automatically.
 */
export interface FeatureFlags {
  wishlist: boolean;
  /** Logged-in customers use the standard Shopware wishlist (false if the theme replaces it, e.g. with own lists). */
  wishlistForCustomers: boolean;
  /** Logged-in customers save products to named lists (plugin/theme "My Lists", e.g. /account/product-lists). */
  productListsForCustomers: boolean;
  guestCheckout: boolean;
  registration: boolean;
  /** Registration requires e-mail confirmation (double opt-in). */
  doubleOptInRegistration: boolean;
  productReviews: boolean;
  productTaxInfo: boolean;
  productDeliveryInfo: boolean;
  contactForm: boolean;
  newsletter: boolean;
  promotionCodes: boolean;
  /** Cookie consent banner is shown to first-time visitors. */
  cartAutoOpensAfterAdd: boolean;
  cookieBanner: boolean;
  languageSwitch: boolean;
  currencySwitch: boolean;
  /** Mobile off-canvas navigation exists (Shopware default). */
  mobileNavigation: boolean;
}

export interface ProductRef {
  /** SEO path relative to baseURL, e.g. "/Canvas-Tote-Bag/A-BAG-001-CREAM" */
  path: string;
  productNumber: string;
  name: string;
}

export interface RedirectRule {
  from: string;
  /** Expected final path (regex source or plain path prefix). */
  to: string;
  /** Only applies to logged-out visitors (default true). */
  guestOnly?: boolean;
}

export interface CustomerAddress {
  street: string;
  zipcode: string;
  city: string;
  /** Optional phone number; some storefronts require it for registration. */
  phone?: string;
  /** ISO 3166 alpha-2, resolved to a countryId via Store API / UI */
  countryIso: string;
  /** Visible country name in the storefront select (used by UI flows). */
  countryLabel?: string;
  /** Visible state name in the storefront select (UI flows; only for countries with states). */
  stateLabel?: string;
}

export interface ProjectConfig {
  /** Human readable name, shown in reports. */
  name: string;
  baseURL: string;
  /** Shopware storefront locale — used for price parsing only. */
  locale: string;
  currencySymbol: string;

  features: FeatureFlags;

  /** Paths of important storefront routes (override for custom routing). */
  routes: {
    home: string;
    login: string;
    register: string;
    account: string;
    accountProfile: string;
    accountAddresses: string;
    accountOrders: string;
    logout: string;
    cart: string;
    checkoutRegister: string;
    checkoutConfirm: string;
    checkoutFinish: string;
    search: string;
    wishlist: string;
    /** Overview of the customer's product lists (only with features.productListsForCustomers) */
    productLists?: string;
    /** Path of a CMS page containing the contact form (null = discover via footer). */
    contactPage: string | null;
  };

  testData: {
    /** Main navigation category names in display order (first N are checked). */
    mainCategories: string[];
    /** A category with enough products for listing / filter / sorting tests. */
    listingCategoryPath: string;
    /** A simple (non-variant) product that can be bought. */
    simpleProduct: ProductRef;
    /** A product with variants (configurator). */
    variantProduct: ProductRef & {
  optionGroups: string[];
  switchGroupIndex?: number;
};
    /** Search term that returns results. */
    searchTerm: string;
    /** Minimum number of hits expected for searchTerm. */
    searchMinResults: number;
    /** Search term guaranteed to return nothing. */
    searchNoResultTerm: string;
    /** Filter types that must exist on the listing page (language independent). */
    expectedFilterTypes: Array<'manufacturer' | 'properties' | 'price' | 'rating' | 'boolean'>;
    /** Sorting option keys that must exist (Shopware values). */
    expectedSortings: string[];
    customer: {
      emailDomain: string;
      emailPrefix: string;
      password: string;
      firstName: string;
      lastName: string;
      /** Salutation option index in the select (0 = "not specified"). */
      salutationIndex: number;
      address: CustomerAddress;
    };
    /** Visible text of the footer link leading to the contact form. */
    contactLinkText: RegExp;
    /** Payment/shipping method labels to select in checkout; null = keep default. */
    paymentMethod: string | null;
    shippingMethod: string | null;
    promotionCode: string | null;
    /** Read-only checkout edge-case checks (tests/client); omit to skip them. */
    checkoutEdgeCases?: {
      product: ProductRef & { quantity: number };
      /** Baseline guest address that must offer the standard methods. */
      baselineAddress: CustomerAddress;
      baselineShippingMethod: string;
      baselinePaymentMethod: string;
      /** Every visible "UPS …" method must be one of these. */
      allowedUpsMethods: string[];
      /** Non-US address: no UPS, only the manual shipping method. */
      canadaAddress: CustomerAddress;
      willContactShippingMethod: string;
      /** Exact set of payment methods offered for canadaAddress. */
      canadaPaymentMethods: string[];
      onAccountPaymentMethod: string;
      /** US territory: no UPS, only willContactShippingMethod (Will Contact). */
      puertoRicoAddress: CustomerAddress;
      /** Military APO/FPO: no UPS, only willContactShippingMethod. */
      apoAddress: CustomerAddress;
      /** Non-contiguous US states: no UPS, only willContactShippingMethod. */
      alaskaAddress: CustomerAddress;
      hawaiiAddress: CustomerAddress;
      /**
       * Documented blocked countries (admin-configurable) with their observed blocking mechanism:
       * 'absent' = not offered in the country selector; 'checkout' = selectable, but checkout is blocked.
       */
      blockedCountries: Array<CustomerAddress & { blockedBy: 'absent' | 'checkout' }>;
      /** Checkout error shown for a blocked destination. */
      blockedShippingMessage: string;
      wireTransferPaymentMethod: string;
      /** International guest destination: Wire Transfer is offered. */
      ukAddress: CustomerAddress;
      /** Expected state of the B2C customer's invoiced (Sage) order — the order itself comes from env. */
      invoicedOrder: { status: string };
    };
  };

  /** Redirects that must work (checked for guests unless stated). */
  redirects: RedirectRule[];

  /** Links (paths) that must resolve with a status < 400. */
  importantLinks: string[];

  /** Selector overrides for themes / customisations. Merged over Shopware 6.7 defaults. */
  selectors?: DeepPartial<Selectors>;
}

/** Final config after env overrides + selector merge. */
export interface ResolvedConfig extends Omit<ProjectConfig, 'selectors'> {
  selectors: Selectors;
  env: {
    httpCredentials?: { username: string; password: string };
    admin: {
      clientId?: string;
      clientSecret?: string;
      username?: string;
      password?: string;
    };
    accessKey?: string;
    /** Existing B2C customer for logged-in checks (ACT_B2C_EMAIL / ACT_B2C_PASSWORD). */
    b2cCustomer?: { email: string; password: string };
    /** Invoiced Done order of b2cCustomer and its invoice (ACT_INVOICED_ORDER_NUMBER / ACT_INVOICED_INVOICE_NUMBER). */
    invoicedOrderNumber?: string;
    invoicedInvoiceNumber?: string;
    allowWriteTests: boolean;
    cleanupTestData: boolean;
  };
}
