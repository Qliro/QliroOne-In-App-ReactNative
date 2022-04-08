# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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