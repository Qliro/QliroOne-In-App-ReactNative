const {
  createRunOncePlugin,
  withEntitlementsPlist,
  withInfoPlist,
} = require('@expo/config-plugins');

const pkg = require('../package.json');

/**
 * The payment apps the checkout hands off to on iOS.
 *
 * iOS only: on Android the equivalent (`<queries>` for com.bankid.bus and se.bankgirot.swish) is
 * declared in the native SDK's own AndroidManifest.xml and merges into the app automatically, so
 * there is nothing for this plugin to add there.
 */
const DEFAULT_URL_SCHEMES = ['bankid', 'swish'];

/** The entitlement key Apple Pay merchant IDs live under. */
const APPLE_PAY_ENTITLEMENT = 'com.apple.developer.in-app-payments';

/**
 * Adds `schemes` to `LSApplicationQueriesSchemes` without disturbing what is already there.
 *
 * `canOpenURL` — which is how the checkout decides whether to offer BankID or Swish at all —
 * returns false for any scheme not listed here, so a missing entry shows up as the payment method
 * silently not appearing rather than as an error.
 *
 * Exported for the unit tests: it is a plain object transform, so it can be asserted on directly
 * without standing up an Expo config pipeline.
 *
 * @param {Record<string, unknown>} infoPlist - The Info.plist object, mutated in place
 * @param {string[]} schemes - Schemes to ensure are present
 * @returns {Record<string, unknown>} The same object
 */
function addUrlSchemes(infoPlist, schemes) {
  const existing = Array.isArray(infoPlist.LSApplicationQueriesSchemes)
    ? infoPlist.LSApplicationQueriesSchemes
    : [];

  // A Set would reorder on some engines and this array ends up in a diffable plist, so append in
  // order and skip what is already present.
  const merged = [...existing];
  for (const scheme of schemes) {
    if (!merged.includes(scheme)) {
      merged.push(scheme);
    }
  }

  infoPlist.LSApplicationQueriesSchemes = merged;
  return infoPlist;
}

/**
 * Adds `merchantId` to the Apple Pay entitlement, leaving any merchant IDs the app already
 * declares in place.
 *
 * A falsy `merchantId` is a no-op rather than an error: Apple Pay is optional, and writing an empty
 * entitlement array would make the app request a capability it cannot use, which App Store review
 * rejects.
 *
 * Exported for the unit tests, as with {@link addUrlSchemes}.
 *
 * @param {Record<string, unknown>} entitlements - The entitlements object, mutated in place
 * @param {string | undefined} merchantId - The `merchant.…` identifier
 * @returns {Record<string, unknown>} The same object
 */
function addApplePayMerchantId(entitlements, merchantId) {
  if (!merchantId) {
    return entitlements;
  }

  const existing = Array.isArray(entitlements[APPLE_PAY_ENTITLEMENT])
    ? entitlements[APPLE_PAY_ENTITLEMENT]
    : [];

  if (!existing.includes(merchantId)) {
    entitlements[APPLE_PAY_ENTITLEMENT] = [...existing, merchantId];
  } else {
    entitlements[APPLE_PAY_ENTITLEMENT] = existing;
  }

  return entitlements;
}

/**
 * Expo config plugin for the QliroOne checkout.
 *
 * Applies the native edits the SDK requires, which an Expo app otherwise has to make by hand after
 * `expo prebuild` — and lose again on the next prebuild:
 *
 * - `LSApplicationQueriesSchemes` entries for the BankID and Swish hand-offs (iOS)
 * - the Apple Pay entitlement and merchant ID, when `applePayMerchantId` is given (iOS)
 *
 * @param {import('@expo/config-types').ExpoConfig} config
 * @param {{ applePayMerchantId?: string, urlSchemes?: string[] }} [props]
 */
function withQliroOne(config, props = {}) {
  const { applePayMerchantId, urlSchemes = DEFAULT_URL_SCHEMES } = props;

  let nextConfig = withInfoPlist(config, (modConfig) => {
    modConfig.modResults = addUrlSchemes(modConfig.modResults, urlSchemes);
    return modConfig;
  });

  // Only registered when a merchant ID is configured. An unconditional withEntitlementsPlist would
  // create an empty entitlements file for every app that installs this package, including the
  // majority that never enable Apple Pay.
  if (applePayMerchantId) {
    nextConfig = withEntitlementsPlist(nextConfig, (modConfig) => {
      modConfig.modResults = addApplePayMerchantId(
        modConfig.modResults,
        applePayMerchantId
      );
      return modConfig;
    });
  }

  return nextConfig;
}

// createRunOncePlugin keeps the mods idempotent when the plugin is reachable more than once in a
// config graph (an app listing it directly plus a shared config preset that also lists it).
module.exports = createRunOncePlugin(withQliroOne, pkg.name, pkg.version);

module.exports.withQliroOne = withQliroOne;
module.exports.addUrlSchemes = addUrlSchemes;
module.exports.addApplePayMerchantId = addApplePayMerchantId;
module.exports.DEFAULT_URL_SCHEMES = DEFAULT_URL_SCHEMES;
module.exports.APPLE_PAY_ENTITLEMENT = APPLE_PAY_ENTITLEMENT;
