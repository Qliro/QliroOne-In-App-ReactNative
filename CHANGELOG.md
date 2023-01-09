# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
