# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Transparent order process**: `onError`, `onLog`, `onStateChanged`, and `onTelemetryEvent`
  callbacks, plus `isDebugEnabled` and `loadTimeoutMs` props — surfaced to JS on both platforms.
- `onClosePopup` callback.
- `additionalAllowedUrlSchemes` prop (iOS only), exposing the iOS SDK's
  `QliroOneCheckout.additionalAllowedUrlSchemes`. The 3.0 URL hardening refuses any hand-off to a
  scheme outside a built-in allowlist, which would otherwise leave a merchant whose payment flow
  returns through a custom scheme with no way to permit it through this wrapper. The Android SDK has
  no equivalent API and ignores the prop.

### Changed
- **The version jumps to 3.0.0**, from the `0.2.0-dev` line. The React Native wrapper, the iOS SDK
  and the Android SDK are released together as the 3.0 train and now share one version number, so a
  merchant on `3.0.0` is on the same release across all three platforms. The jump is a renumbering,
  not 2.x worth of intervening releases — nothing was published between `0.2.0-dev.7` and this.
- **BREAKING — the npm package is renamed** from `qliroone_reactnative` to
  `@qliro/react-native-qliro-one`. Update the dependency and every import; see
  [MIGRATION.md](MIGRATION.md#breaking-change-the-package-is-renamed). The old name stays on npm at
  `0.1.22` and is deprecated, so existing installs keep resolving. No component, prop or native
  identifier changed — the podspec is still `QlirooneReactnative` and the Android package is still
  `com.qliroonereactnative`.
- SDK version reported to native is sourced solely from `package.json` and stamped into the
  iOS/Android bridges by `scripts/sync-version.js` (runs on `prepare`). Fixes the prior drift where
  Android reported `0.2.0` while package/iOS reported `0.2.0-dev.7`.
- `homepage` now points at the [Qliro developer portal](https://developers.qliro.com/docs/qliro-one)
  and `bugs` is an email address, replacing GitHub URLs for a repository that is not where this SDK
  is developed and where nobody triages issues.
- The native SDK pins move to the joint 3.0.0 release: `com.qliro:qliroone` 3.0.0
  (`android/gradle.properties`) and `QliroOne` 3.0.0 (`QlirooneReactnative.podspec`, and the
  `example/` and `qliro-one-hats` Podfiles that must match it).
- `QlirooneReactnative.podspec`'s `s.source` no longer names the pre-rename GitHub repository. It is
  metadata only — the pod ships inside the npm package and is resolved through autolinking by path,
  never fetched from source.
- `release-it` no longer attempts a GitHub release (`github.release: false`). This repository is on
  self-hosted GitLab and has no GitHub release process, so the step could only ever fail.
- `onShippingPriceChanged` reports `Double` prices (parity with native).
- Android events are dispatched through the Fabric `EventDispatcher` (as `Event` instances carrying
  the view's real `surfaceId`) instead of the legacy `RCTEventEmitter` interop shim, and the
  ViewManager no longer exports legacy direct-event constants. The bridge no longer depends on the
  `useFabricInterop` feature flag, which React Native turns off in strict New Architecture mode —
  every callback was silently dropped there.

### Fixed
- `excludeResultModules` now reaches the native Android SDK; it was a log-only no-op on Android
  while iOS applied it. Unrecognized module names are dropped and reported via `onLog` (`warn`).
- All native event payloads are validated before use (optional-chaining + early return); a
  malformed/empty `nativeEvent` no longer crashes the merchant's checkout.
- Native callbacks (session-expired, order-update) and the scroll throttle timer are cleaned up on
  unmount, preventing fires into a stale native view.
- Removed `NSLog` of the Apple Pay merchant id from the iOS bridge.

### Known follow-ups (tracked)
- Reconcile README references to non-existent `onLogged`/`updateOrders`.

## [0.2.0] - 2025-12-03
- Add support for Apple Pay
- Update to new React Native architecture

## [0.1.21] - 2023-10-09

### Changed

- Updated to iOS package version 2.2.8
- Update to Android package version 2.2.8

## [0.1.20] - 2023-10-09

### Changed

- Updated to iOS package version 2.2.7
- Update to Android package version 2.2.7

## [0.1.19] - 2023-06-26

### Changed

- Updated to iOS package version 2.2.5
- Update to Android package version 2.2.5

## [0.1.18] - 2023-05-26

### Changed

- Fixed onPaymentDeclined crash
- Updated to iOS package version 2.2.4
- Update to Android package version 2.2.4

## [0.1.17] - 2023-02-16

### Changed

- Add experimental support for `accessCode` callback parameter in `onShippingMethodChanged`

## [0.1.16] - 2023-01-12

### Changed

- Fix Android build bug

## [0.1.15] - 2023-01-09

### Changed

- Update to iOS package version 2.2.0 to enable PayPal support
- Update to Android package version 2.2.0

## [0.1.14] - 2022-11-16

### Changed

- Update readme

## [0.1.13] - 2022-11-14

### Added

- Add support for swish

## [0.1.12] - 2022-11-08

### Changed

- Enforce isScrollEnabled to be true as default
- Fixed checkout height issue

## [0.1.11] - 2022-11-08

### Added

- Add optional parameter merchantUpdateVersion to order

## [0.1.10] - 2022-10-08

### Changed

- BankID redirect fix for Android
- Make use of double for all price parameters

## [0.1.9] - 2022-10-08

### Changed

- Align all payloads with QliroOne.

## [0.1.8] - 2022-10-08

### Changed

- Add missing types for lock and unlock functions.

## [0.1.7] - 2022-10-07

### Changed

- Made locked prop into a component function again.

## [0.1.6] - 2022-10-07

### Changed

- Fix customer parameter in customerinfochanged callback.

## [0.1.5] - 2022-10-07

### Changed

- Changed type for postalCode from number to string.

## [0.1.4] - 2022-10-01

### Changed

- Fix iOS crash when deauthenticating event is called.

## [0.1.3] - 2022-09-15

### Changed

- Fix context creation issue in Android bridge.

## [0.1.2] - 2022-09-15

### Changed

- Fix import issue in iOS

## [0.1.1] - 2022-09-15

### Changed

- Update android package
- Remove android configuration breaking build

## [0.1.0] - 2022-09-15

### Changed

- `lock` and `unlock` functions in the QliroOneCheckout is now a property called `locked`
- `updateOrders` function has been removed and is now `addOrderUpdateCallback` and `removeOrderUpdateCallback` to follow the conventions of the web implementation.
- The webview is now built custom in separate Android and iOS packages. React Native Webview is not used anymore.
- Updated the README with new changes for native packages.
- Removed baseurl parameter

## [0.0.6] - 2022-05-30

### Added

- Optional baseurl parameter to QliroOneProps

## [0.0.5] - 2022-04-08

### Changed

- Adjust nullable properties in shipping model

## [0.0.4] - 2022-04-08

### Changed

- Simplify the way of loading urls from qliroone by checking navigationtype
- Update shipping and payment method types to reflect [documentation](https://developers.qliro.com/docs/qliro-one/frontend-features/listeners)

## [0.0.3] - 2022-03-29

### Changed

- Open up peer dependencies
- Update onCompletePurchaseRedirect to receive an object that contains merchantConfirmationUrl. [Read more](src/QliroOneProps.ts)

### Removed

- Removed onClientHeightChanged log

### Added

- Added changelog
- Added fallback arguments to [all listeners](https://developers.qliro.com/docs/qliro-one/frontend-features/listeners)
- Added missing [onCustomerDeauthenticating listener](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerdeauthenticating()>)
- Added declineReasonMessage to [onPaymentDeclined listener](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentdeclined()>)
- Added newTotalShippingPrice to [onShippingPriceChanged listener](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingpricechanged()>)
