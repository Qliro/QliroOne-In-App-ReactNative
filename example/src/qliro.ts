// Direct-to-staging QliroOne merchant API client for the RN example app.
// No local proxy server: the app signs requests and calls staging directly.
//
// The merchant credentials and the synthetic test identity are NOT in source. They come from
// example/.env (gitignored) and are inlined at build time by react-native-dotenv — see
// example/.env.example and babel.config.js. Signing orders in the app is a STAGING-only
// convenience; a production integration signs them server-side.

import {
  QLIRO_BASE_URL as ENV_BASE_URL,
  QLIRO_MERCHANT_API_KEY,
  QLIRO_MERCHANT_BASE_URL,
  QLIRO_MERCHANT_SECRET,
  QLIRO_ORDER_VALIDATION_URL,
  QLIRO_TEST_EMAIL,
  QLIRO_TEST_FIRST_NAME,
  QLIRO_TEST_LAST_NAME,
  QLIRO_TEST_MOBILE,
  QLIRO_TEST_PERSONAL_NUMBER,
  QLIRO_TEST_POSTAL_CODE,
  QLIRO_TEST_STREET,
} from '@env';

// `allowUndefined` is on in babel.config.js, so a missing .env yields undefined rather than a
// build failure. Coerce to '' here and let missingEnvKeys() report the gap at call time.
const env = (value: string | undefined) => value ?? '';

const QLIRO_BASE_URL = env(ENV_BASE_URL);
const MERCHANT_KEY = env(QLIRO_MERCHANT_API_KEY);
const MERCHANT_SECRET = env(QLIRO_MERCHANT_SECRET);

// Merchant callback URLs. Webhooks won't reach the device without a tunnel,
// but these are required fields for order creation. Placeholders are fine for
// loading the checkout and testing payloads.
const MERCHANT_BASE = env(QLIRO_MERCHANT_BASE_URL);

/// Returns the names of any required .env keys that are missing or blank.
export function missingEnvKeys(): string[] {
  return Object.entries({
    QLIRO_BASE_URL,
    QLIRO_MERCHANT_API_KEY: MERCHANT_KEY,
    QLIRO_MERCHANT_SECRET: MERCHANT_SECRET,
    QLIRO_MERCHANT_BASE_URL: MERCHANT_BASE,
    QLIRO_TEST_PERSONAL_NUMBER: env(QLIRO_TEST_PERSONAL_NUMBER),
    QLIRO_TEST_EMAIL: env(QLIRO_TEST_EMAIL),
    QLIRO_TEST_MOBILE: env(QLIRO_TEST_MOBILE),
    QLIRO_TEST_FIRST_NAME: env(QLIRO_TEST_FIRST_NAME),
    QLIRO_TEST_LAST_NAME: env(QLIRO_TEST_LAST_NAME),
    QLIRO_TEST_STREET: env(QLIRO_TEST_STREET),
    QLIRO_TEST_POSTAL_CODE: env(QLIRO_TEST_POSTAL_CODE),
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);
}

// ---------------------------------------------------------------------------
// SHA-256 (pure JS) -> base64. Auth header = "Qliro " + base64(sha256(body + secret)).
// Dependency-free to avoid the monorepo's peer-dep install conflict.
// ---------------------------------------------------------------------------

function utf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // surrogate pair
      const hi = code;
      const lo = str.charCodeAt(++i);
      code = 0x10000 + ((hi & 0x3ff) << 10) + (lo & 0x3ff);
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    } else {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f)
      );
    }
  }
  return bytes;
}

// Typed arrays rather than number[] throughout: every index below is provably in bounds, but
// `noUncheckedIndexedAccess` widens number[] reads to `number | undefined`. Uint8Array/Uint32Array
// index as plain `number`, so the arithmetic stays readable without non-null assertions.
function sha256Bytes(message: number[]): number[] {
  const K = Uint32Array.from([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const padded = message.slice();
  const bitLen = padded.length * 8;
  padded.push(0x80);
  while (padded.length % 64 !== 56) padded.push(0);
  // 64-bit big-endian length (high 32 bits assumed 0 for our small payloads)
  for (let i = 7; i >= 0; i--) padded.push((bitLen / 2 ** (8 * i)) & 0xff);
  const bytes = Uint8Array.from(padded);

  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  const w = new Uint32Array(64);

  // Indexed reads go through these: every index is provably in bounds, but
  // `noUncheckedIndexedAccess` widens each read to `number | undefined`.
  const at = (arr: Uint8Array | Uint32Array, i: number) => arr[i] as number;

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const j = chunk + i * 4;
      w[i] =
        ((at(bytes, j) << 24) |
          (at(bytes, j + 1) << 16) |
          (at(bytes, j + 2) << 8) |
          at(bytes, j + 3)) >>>
        0;
    }
    for (let i = 16; i < 64; i++) {
      const w15 = at(w, i - 15);
      const w2 = at(w, i - 2);
      const s0 = rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3);
      const s1 = rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10);
      w[i] = (at(w, i - 16) + s0 + at(w, i - 7) + s1) >>> 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + at(K, i) + at(w, i)) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out: number[] = [];
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((hv) => {
    out.push(
      (hv >>> 24) & 0xff,
      (hv >>> 16) & 0xff,
      (hv >>> 8) & 0xff,
      hv & 0xff
    );
  });
  return out;
}

function base64(input: number[]): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = Uint8Array.from(input);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] as number;
    const b1 = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0;
    const b2 = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0;
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return out;
}

function authHeader(bodyJson: string): string {
  const token = base64(sha256Bytes(utf8Bytes(bodyJson + MERCHANT_SECRET)));
  return `Qliro ${token}`;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function createOrder(
  orderData: Record<string, any>
): Promise<any> {
  const missing = missingEnvKeys();
  if (missing.length) {
    throw new Error(
      `Missing ${missing.join(', ')} — copy example/.env.example to example/.env and fill it in, ` +
        'then restart Metro with --reset-cache.'
    );
  }

  const body = JSON.stringify(orderData);
  const res = await fetch(`${QLIRO_BASE_URL}/checkout/merchantapi/Orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(body),
    },
    body,
  });
  if (!res.ok) throw new Error(`create ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getOrder(orderId: string | number): Promise<any> {
  const res = await fetch(
    `${QLIRO_BASE_URL}/checkout/merchantapi/Orders/${orderId}`,
    { method: 'GET', headers: { Authorization: authHeader('') } }
  );
  if (!res.ok) throw new Error(`get ${res.status}: ${await res.text()}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Feature test payloads
// ---------------------------------------------------------------------------

// Synthetic staging identity, supplied via example/.env — never hardcoded here.
const testAddress = {
  FirstName: env(QLIRO_TEST_FIRST_NAME),
  LastName: env(QLIRO_TEST_LAST_NAME),
  Street: env(QLIRO_TEST_STREET),
  PostalCode: env(QLIRO_TEST_POSTAL_CODE),
};

const physicalCustomer = {
  PersonalNumber: env(QLIRO_TEST_PERSONAL_NUMBER),
  Email: env(QLIRO_TEST_EMAIL),
  MobileNumber: env(QLIRO_TEST_MOBILE),
  JuridicalType: 'Physical',
  Address: testAddress,
  LockCustomerInformation: true,
};

const juridicalCustomer = {
  PersonalNumber: env(QLIRO_TEST_PERSONAL_NUMBER),
  // The B2B scenario needs a distinct address from the company contact email.
  Email: env(QLIRO_TEST_EMAIL).replace(/^[^@]+/, 'company'),
  MobileNumber: env(QLIRO_TEST_MOBILE),
  // 'Company', not 'Juridical' — the merchant API rejects the latter with
  // "The field JuridicalType is invalid."
  JuridicalType: 'Company',
  CompanyEntity: { OrganizationNumber: '5560000000', CompanyName: 'Hat Co AB' },
  Address: testAddress,
  LockCustomerInformation: true,
};

// Qliro's documented staging "Denied" identity (Sweden B2C). An order locked to it triggers
// Qliro's *credit* denial, which the checkout renders inline — it does NOT fire
// onPaymentDeclined; that callback is reserved for merchant order-validation rejections (see the
// validation-decline variant below). Other countries' denied identities:
// https://developers.qliro.com/docs/qliro-checkout/get-started/testing
const deniedCustomer = {
  ...physicalCustomer,
  PersonalNumber: '750420-8104',
};

function baseOrder(): Record<string, any> {
  return {
    MerchantReference: `TEST-ORDER-${Date.now()}`,
    Country: 'SE',
    Currency: 'SEK',
    Language: 'sv-se',
    MerchantApiKey: MERCHANT_KEY,
    MerchantConfirmationUrl: `${MERCHANT_BASE}/confirmation`,
    MerchantTermsUrl: `${MERCHANT_BASE}/terms`,
    MerchantOrderManagementStatusPushUrl: `${MERCHANT_BASE}/push/management`,
    MerchantCheckoutStatusPushUrl: `${MERCHANT_BASE}/push/status`,
  };
}

const redHat = {
  MerchantReference: 'RedHat',
  DisplayName: 'Red hat',
  Description: 'Match the trees during the fall.',
  PricePerItemExVat: 239.2,
  PricePerItemIncVat: 299.0,
  Quantity: 1,
  Type: 'Product',
};

export type PayloadVariant = {
  key: string;
  label: string;
  build: () => Record<string, any>;
};

export const PAYLOADS: PayloadVariant[] = [
  {
    key: 'multi-vat',
    label: 'Multiple items / mixed VAT',
    build: () => ({
      ...baseOrder(),
      CustomerInformation: physicalCustomer,
      OrderItems: [
        redHat, // 25% VAT
        {
          MerchantReference: 'Book',
          DisplayName: 'Hat care guide (book)',
          Description: 'Reduced 6% VAT item.',
          PricePerItemExVat: 94.34,
          PricePerItemIncVat: 100.0,
          Quantity: 2,
          Type: 'Product',
        },
      ],
    }),
  },
  {
    key: 'discount',
    label: 'Discount / promo',
    build: () => ({
      ...baseOrder(),
      CustomerInformation: physicalCustomer,
      OrderItems: [
        { ...redHat, Quantity: 2 },
        {
          MerchantReference: 'PROMO10',
          DisplayName: '10% launch discount',
          Description: 'Promotional discount.',
          PricePerItemExVat: -47.84,
          PricePerItemIncVat: -59.8,
          Quantity: 1,
          Type: 'Discount',
        },
      ],
    }),
  },
  {
    key: 'shipping',
    label: 'Shipping method',
    build: () => ({
      ...baseOrder(),
      CustomerInformation: physicalCustomer,
      OrderItems: [
        redHat,
        {
          MerchantReference: 'SHIP-STD',
          DisplayName: 'Standard shipping',
          Description: 'Home delivery 2-4 days.',
          PricePerItemExVat: 39.2,
          PricePerItemIncVat: 49.0,
          Quantity: 1,
          Type: 'Shipping',
        },
      ],
    }),
  },
  {
    key: 'company',
    label: 'Company (B2B) customer',
    build: () => ({
      ...baseOrder(),
      CustomerInformation: juridicalCustomer,
      OrderItems: [{ ...redHat, Quantity: 5 }],
    }),
  },
  {
    key: 'fasttrack',
    label: 'Fasttrack (express checkout)',
    // EnableExpressCheckout is an order-level flag; customer info is collected
    // in the express flow, so it is not pre-locked here. Fasttrack is also a
    // paid line item so the order has a non-zero total.
    build: () => ({
      ...baseOrder(),
      EnableExpressCheckout: true,
      OrderItems: [
        redHat,
        {
          MerchantReference: 'Fasttrack',
          DisplayName: 'Fasttrack service',
          Description: 'Express checkout service.',
          PricePerItemExVat: 79.2,
          PricePerItemIncVat: 99.0,
          Quantity: 1,
          Type: 'Product',
        },
      ],
    }),
  },
  {
    key: 'declined',
    label: 'Credit denied (denied test SSN, inline UI only)',
    build: () => ({
      ...baseOrder(),
      CustomerInformation: deniedCustomer,
      OrderItems: [redHat],
    }),
  },
  {
    key: 'validation-decline',
    label: 'Merchant validation decline (fires onPaymentDeclined)',
    // Qliro POSTs the order to QLIRO_ORDER_VALIDATION_URL when the customer clicks pay; an
    // OrderApproved:false answer is the one thing that fires onPaymentDeclined. The endpoint must
    // be reachable from Qliro staging — an ngrok tunnel to a local always-decline server works.
    // Missing env key -> order is created without the URL and payment just completes.
    build: () => ({
      ...baseOrder(),
      CustomerInformation: physicalCustomer,
      OrderItems: [redHat],
      ...(env(QLIRO_ORDER_VALIDATION_URL)
        ? { MerchantOrderValidationUrl: env(QLIRO_ORDER_VALIDATION_URL) }
        : {}),
    }),
  },
];
