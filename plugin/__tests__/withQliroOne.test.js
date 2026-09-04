const {
  addApplePayMerchantId,
  addUrlSchemes,
  APPLE_PAY_ENTITLEMENT,
  DEFAULT_URL_SCHEMES,
  withQliroOne,
} = require('../withQliroOne');

// The mods are plain object transforms, so they are asserted directly rather than through an Expo
// config pipeline — no prebuild, no fixture project, no temp directories.
describe('addUrlSchemes', () => {
  it('adds the schemes to an Info.plist that has none', () => {
    const infoPlist = {};

    addUrlSchemes(infoPlist, DEFAULT_URL_SCHEMES);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid', 'swish']);
  });

  it('preserves schemes the app already declares', () => {
    const infoPlist = { LSApplicationQueriesSchemes: ['mailto', 'tel'] };

    addUrlSchemes(infoPlist, DEFAULT_URL_SCHEMES);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual([
      'mailto',
      'tel',
      'bankid',
      'swish',
    ]);
  });

  it('does not duplicate a scheme that is already present', () => {
    const infoPlist = { LSApplicationQueriesSchemes: ['bankid'] };

    addUrlSchemes(infoPlist, DEFAULT_URL_SCHEMES);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid', 'swish']);
  });

  it('is idempotent across repeated prebuilds', () => {
    const infoPlist = {};

    addUrlSchemes(infoPlist, DEFAULT_URL_SCHEMES);
    addUrlSchemes(infoPlist, DEFAULT_URL_SCHEMES);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid', 'swish']);
  });

  it('accepts a caller-supplied scheme list', () => {
    const infoPlist = {};

    addUrlSchemes(infoPlist, ['bankid']);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid']);
  });

  it('replaces a non-array value rather than appending to it', () => {
    const infoPlist = { LSApplicationQueriesSchemes: 'bankid' };

    addUrlSchemes(infoPlist, ['swish']);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['swish']);
  });
});

describe('addApplePayMerchantId', () => {
  it('writes the merchant ID into the entitlement', () => {
    const entitlements = {};

    addApplePayMerchantId(entitlements, 'merchant.com.example.app');

    expect(entitlements[APPLE_PAY_ENTITLEMENT]).toEqual([
      'merchant.com.example.app',
    ]);
  });

  it('preserves merchant IDs the app already declares', () => {
    const entitlements = {
      [APPLE_PAY_ENTITLEMENT]: ['merchant.com.example.other'],
    };

    addApplePayMerchantId(entitlements, 'merchant.com.example.app');

    expect(entitlements[APPLE_PAY_ENTITLEMENT]).toEqual([
      'merchant.com.example.other',
      'merchant.com.example.app',
    ]);
  });

  it('is idempotent across repeated prebuilds', () => {
    const entitlements = {};

    addApplePayMerchantId(entitlements, 'merchant.com.example.app');
    addApplePayMerchantId(entitlements, 'merchant.com.example.app');

    expect(entitlements[APPLE_PAY_ENTITLEMENT]).toEqual([
      'merchant.com.example.app',
    ]);
  });

  // Requesting the Apple Pay capability without a usable merchant ID is an App Store review
  // rejection, so an absent ID must leave the entitlements untouched rather than write an empty
  // array.
  it.each([undefined, ''])('leaves entitlements untouched for %p', (value) => {
    const entitlements = {};

    addApplePayMerchantId(entitlements, value);

    expect(entitlements).toEqual({});
  });

  it('replaces a non-array value rather than appending to it', () => {
    const entitlements = { [APPLE_PAY_ENTITLEMENT]: 'merchant.com.legacy' };

    addApplePayMerchantId(entitlements, 'merchant.com.example.app');

    expect(entitlements[APPLE_PAY_ENTITLEMENT]).toEqual([
      'merchant.com.example.app',
    ]);
  });
});

describe('withQliroOne', () => {
  // Exercises the plugin end to end against a minimal config, driving each registered iOS mod the
  // way Expo's config pipeline does: call the mod's action with a fresh `modResults` and keep what
  // it returns. The actions are async, hence the awaits.
  async function runIosMods(config) {
    const results = { infoPlist: null, entitlements: null };
    const mods = config.mods?.ios ?? {};

    for (const [modName, action] of Object.entries(mods)) {
      const out = await action({ ...config, modResults: {} });
      results[modName] = out.modResults;
    }

    return results;
  }

  it('registers only the Info.plist mod when no merchant ID is given', async () => {
    const config = withQliroOne({ name: 'test', slug: 'test' });

    const { infoPlist, entitlements } = await runIosMods(config);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid', 'swish']);
    expect(entitlements).toBeNull();
  });

  it('registers the entitlements mod when a merchant ID is given', async () => {
    const config = withQliroOne(
      { name: 'test', slug: 'test' },
      { applePayMerchantId: 'merchant.com.example.app' }
    );

    const { infoPlist, entitlements } = await runIosMods(config);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid', 'swish']);
    expect(entitlements[APPLE_PAY_ENTITLEMENT]).toEqual([
      'merchant.com.example.app',
    ]);
  });

  it('honours a custom urlSchemes prop', async () => {
    const config = withQliroOne(
      { name: 'test', slug: 'test' },
      { urlSchemes: ['bankid'] }
    );

    const { infoPlist } = await runIosMods(config);

    expect(infoPlist.LSApplicationQueriesSchemes).toEqual(['bankid']);
  });

  // The package entry point is what Expo actually loads from `expo.plugins`; a broken re-export
  // here fails only at prebuild time, which is exactly where it is most expensive to discover.
  it('is exported from the package-root app.plugin.js entry', () => {
    const entry = require('../../app.plugin.js');

    expect(typeof entry).toBe('function');
    expect(entry.withQliroOne).toBe(withQliroOne);
  });
});
