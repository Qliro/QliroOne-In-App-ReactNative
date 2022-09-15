# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

