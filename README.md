> **Read-only release mirror.** This repository is a source snapshot of the
> `@qliro/react-native-qliro-one` npm package, updated at each release. Development does not happen
> here and issues/PRs are not monitored — install from
> [npm](https://www.npmjs.com/package/@qliro/react-native-qliro-one), read the docs at
> [developers.qliro.com](https://developers.qliro.com/docs/qliro-one), and reach the team at
> app@qliro.com.

# QliroOne Checkout

## What does QliroOne Checkout offer?

This package wraps QliroOne Checkout and exposes its functionality as a React Native component.

## Requirements

React Native **0.76 or later** with the New Architecture enabled. This is a Fabric component and
does not work on the legacy (Paper) renderer — see [MIGRATION.md](MIGRATION.md).

## Getting started

Install the package `yarn add @qliro/react-native-qliro-one`

### iOS

Run `bundle exec pod install`.

### Android

Nothing more required. The native SDK's manifest declares the `<queries>` entries for the BankID and
Swish apps and they merge into your app automatically.

### Expo

Expo apps do not edit native projects by hand, so this package ships a
[config plugin](https://docs.expo.dev/config-plugins/introduction/) that makes the iOS changes below
for you. Add it to `app.json` and run `npx expo prebuild`:

```json
{
  "expo": {
    "plugins": [
      [
        "@qliro/react-native-qliro-one",
        {
          "applePayMerchantId": "merchant.com.yourcompany.yourapp"
        }
      ]
    ]
  }
}
```

| Prop | Default | Effect |
| --- | --- | --- |
| `applePayMerchantId` | — | Adds the `com.apple.developer.in-app-payments` entitlement with this merchant ID. Omit it and no entitlement is written, which is what you want unless you accept Apple Pay |
| `urlSchemes` | `["bankid", "swish"]` | The `LSApplicationQueriesSchemes` entries to add |

The plugin only appends: merchant IDs and schemes your app already declares are preserved, and
re-running `prebuild` does not duplicate entries. It requires the New Architecture, so keep
`"newArchEnabled": true` in your Expo config (the default since SDK 52).

Everything the plugin does is listed under [Payment Providers](#payment-providers) and
[docs/apple-pay-react-native.md](docs/apple-pay-react-native.md) — a bare React Native app makes
those edits directly instead.

## Payment Providers

### BankID (Trustly and customer authentication)

To be able to open BankID in Sweden you will have to add an entry in the `Info.plist` for iOS:

```xml
	<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>bankid</string>
	</array>
```

### Swish

To be able to open Swish in Sweden you will have to add an entry in the `Info.plist` for iOS:

```xml
	<key>LSApplicationQueriesSchemes</key>
	<array>
		<string>swish</string>
	</array>
```

On Expo, the [config plugin](#expo) adds both for you.

## Usage

Import the `QliroOneCheckout` component from `@qliro/react-native-qliro-one` and use it like:

With scroll enabled (default):

```jsx
import React from "react";
import { View } from "react-native";
import { QliroOneCheckout, type QliroOneCheckoutRef } from "@qliro/react-native-qliro-one";

// ...

const CheckoutPage = () => {
  const checkoutRef = useRef<QliroOneCheckoutRef>(null);

  return (
    <View style={{ flex: 1 }}>
      <QliroOneCheckout
        ref={checkoutRef}
        orderHtml={htmlSnippet}
        isScrollEnabled={true}
        onCheckoutLoaded={() => console.log("loaded")}
      />
    </View>
  );
};
```

With scroll disabled:

```jsx
import React from "react";
import { View } from "react-native";
import { QliroOneCheckout, type QliroOneCheckoutRef } from "@qliro/react-native-qliro-one";

// ...

const CheckoutPage = () => {
  const checkoutRef = useRef<QliroOneCheckoutRef>(null);

  return (
    <ScrollView style={{ flex: 1 }}>
      <QliroOneCheckout
        ref={checkoutRef}
        orderHtml={htmlSnippet}
        isScrollEnabled={false}
        onCheckoutLoaded={() => console.log('loaded')}
      />
    </ScrollView>
  );
};
```

### useQliroOneCheckout

The component is driven imperatively through a ref, and most integrations end up writing the same
state plumbing around it. `useQliroOneCheckout()` is that plumbing:

```tsx
import { QliroOneCheckout, useQliroOneCheckout, isFatalError } from '@qliro/react-native-qliro-one';

const CheckoutPage = () => {
  const checkout = useQliroOneCheckout();

  return (
    <View style={{ flex: 1 }}>
      {checkout.state === 'loading' && <Spinner />}
      {checkout.lastError && isFatalError(checkout.lastError.code) && <Retry />}

      <QliroOneCheckout {...checkout.checkoutProps} orderHtml={htmlSnippet} />
    </View>
  );
};
```

| Returns | |
| --- | --- |
| `ref` | The component ref, for the full imperative surface |
| `state` | The latest `QliroOneCheckoutState`. `'idle'` until the checkout reports otherwise |
| `lastError` | The most recent `{ code, message }`, or `null`. Not cleared on recovery |
| `lock` / `unlock` | The two imperative methods hosts reach for most |
| `checkoutProps` | Spread onto `<QliroOneCheckout>`. Carries `ref`, `onStateChanged` and `onError` |

It is a convenience over the existing props, not a second API — pass your own handlers to the hook
and it calls them after recording:

```tsx
const checkout = useQliroOneCheckout({
  onStateChanged: (state, previous) => track(state, previous),
  onError: (code, message) => report(code, message),
});
```

Spread `checkoutProps` **before** any of `ref`, `onStateChanged` or `onError` you also pass by hand,
or yours will be overwritten.

### Configurable props

The component extends `ViewProps`: `testID`, `accessibilityLabel`, `nativeID`, `pointerEvents` and
the rest are applied to its container view, so end-to-end suites can target the checkout screen.

- [orderHtml](#orderhtml)
- [isScrollEnabled](#isscrollenabled)
- [isCheckoutScrollEnabled](#ischeckoutscrollenabled)
- [excludedResultModules](#excludedresultmodules)
- [isDebugEnabled](#isdebugenabled)
- [loadTimeoutMs](#loadtimeoutms)
- [applePayMerchantId](#applepaymerchantid)
- [additionalAllowedUrlSchemes](#additionalallowedurlschemes)
- [style](#style)

### Checkout Event props

Event handlers are invoked on the JS thread, like any React Native event. Both native SDKs
guarantee main-thread delivery of the underlying callback before it crosses the bridge, so events
arrive in the order the checkout produced them.

- [onCheckoutLoaded](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncheckoutloaded()>)
- [onCustomerInfoChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerinfochanged()>)
- [onCustomerDeauthenticating](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerdeauthenticating()>)
- [onPaymentMethodChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentmethodchanged()>)
- [onPaymentDeclined](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentdeclined()>)
- [onPaymentProcessStart](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>)
- [onPaymentProcessEnd](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>)
- [onShippingMethodChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingmethodchanged()>)
- [onShippingPriceChanged](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingpricechanged()>)
- [onSessionExpired](<https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onsessionexpired()>)

### SDK Specific Event props

- [onCompletePurchaseRedirect](#oncompletepurchaseredirect)
- [onOrderUpdated](#onorderupdated)
- [onCheckoutHeightChanged](#oncheckoutheightchanged)
- [onClosePopup](#onclosepopup)
- [onError](#onerror)
- [onLog](#onlog)
- [onStateChanged](#onstatechanged)
- [onTelemetryEvent](#ontelemetryevent)
- [onApplePayPaymentRequest](#onapplepaypaymentrequest)

### Checkout Actions

- [lock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [unlock](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [enableCheckoutScrolling](https://developers.qliro.com/docs/qliro-one/frontend-features/enable-scrolling)
- [excludeResultModules](https://developers.qliro.com/docs/qliro-one/customization/thank-you-page-customize#how-to)

### SDK Specific Actions

- [addOrderUpdateCallback](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [removeOrderUpdateCallback](https://developers.qliro.com/docs/qliro-one/checkout-features/update-order)
- [loadOrderHtml](#loadorderhtml)
- [onScroll](#onscroll)

### Configurable props

#### orderHtml

The html-snippet to the checkout, it is the html-snippet returned from the [getOrder](https://developers.qliro.com/docs/qliro-one/get-started/load-checkout#get-order).

#### isScrollEnabled

Whether the checkout scrolls its own content. Default `true`. With scrolling disabled the component
is as tall as the checkout's content, and reports height changes through `onCheckoutHeightChanged` —
set it to `false` when nesting the checkout inside another scroll view, and forward that view's
scroll position with [onScroll](#onscroll).

#### isCheckoutScrollEnabled

Whether Qliro One scrolls to the payment or shipping option the customer selects from an expanded
list. Default `false`. No effect while `isScrollEnabled` is `true`.

#### excludedResultModules

Modules to hide on the result ("thank you") page: `"HEADER"`, `"TOTAL_PRICE"`,
`"CUSTOMER_DETAILS"`, `"SHIPPING_METHOD"` (the `QliroOneResultModule` type). Use it when your app
renders its own confirmation and would otherwise duplicate them.

Works on both platforms. A name neither SDK recognizes is dropped with a `warn`-level `onLog`
message rather than failing the call, so a typo is visible without breaking the checkout.

#### isDebugEnabled

Emits verbose `debug`-level messages through `onLog`. Default `false`. **Never enable it in
production** — debug logs describe the checkout's internal traffic.

It affects log verbosity only. Neither native SDK has a TLS bypass: a certificate error on the
checkout cancels the load. (Older Android SDK versions proceeded through certificate errors while
`isDebugEnabled` was set. That was removed. Point test builds at a host with a valid certificate.)

#### loadTimeoutMs

How long the checkout may take to load before `onError` reports `"checkout_load_timeout"`. Default
`30000`. Set `0` to disable the watchdog.

#### applePayMerchantId

The Apple Pay merchant identifier (`merchant.…`) used to accept Apple Pay. iOS only — the native SDK
presents the Apple Pay sheet itself, so no JS payment code is needed. Requires the Apple Pay
entitlement and a merchant ID enabled for your Qliro account. See
[docs/apple-pay-react-native.md](docs/apple-pay-react-native.md).

#### additionalAllowedUrlSchemes

Extra URL schemes the checkout may hand off to another app, on top of the ones the SDK allows by
default. Default `[]`.

The SDK opens a fixed set — `https`, `tel`, `telprompt`, `sms`, `mailto`, and the
BankID/Swish/Vipps/MobilePay payment apps — and refuses everything else with
`onError("untrusted_origin")`, so the checkout page cannot use the SDK to launch arbitrary installed
apps. Set this prop if a payment flow in your integration returns to your app through your own
custom scheme, which would otherwise be blocked.

Give the **scheme only**, without `://` or a path. Matching is case-insensitive:

```jsx
<QliroOneCheckout additionalAllowedUrlSchemes={['myshop']} />
```

iOS only — the Android SDK has no equivalent API, so the prop is ignored there. Android's allowlist
is fixed to `http`/`https` for popups, with BankID and Swish handled by dedicated hand-offs that a
URL cannot redirect. Passing the prop is harmless on both platforms.

> This widens a security boundary. Add only the scheme your own app registers — never a wildcard,
> and never a scheme belonging to someone else.

#### style

A `ViewStyle` applied to the component's container.

### SDK Specific Event props

#### onOrderUpdated

Called after the `addOrderUpdateCallback` action has been registered, when Qliro One has synced its
orders. May fire several times. Once you can validate the order against your cart, call
`removeOrderUpdateCallback` and `unlock` so the customer can interact with the checkout again.

Example:

```jsx
const checkoutRef = useRef<QliroOneCheckoutRef>(null);

const onCartChanged = async () => {
  checkoutRef.current?.lock();
  /// ...
  const updatedCart = await ...
  /// ...
  checkoutRef.current?.addOrderUpdateCallback();
}

const onOrderUpdated = (order: Order) => {
  // Check that the order is synced with your order.
  const orderCorrect = ...
  if (orderCorrect) {
    checkoutRef.current?.removeOrderUpdateCallback();
    checkoutRef.current?.unlock();
  }
};

// ...
<QliroOneCheckout
  onOrderUpdated={onOrderUpdated}
  // ...
/>;
```

#### onCompletePurchaseRedirect

A callback called when a purchase has been completed. The successUrl you created in the createCart will be provided in this callback in
an object as merchantConfirmationUrl: { merchantConfirmationUrl: string }

Example:

```jsx
<QliroOneCheckout
  // ...
  onCompletePurchaseRedirect={(options) => {
    dispatch({ type: "CHECKOUT_SUCCESS" });
    navigation.dispatch(
      StackActions.replace("ThankYou", {
        successUrl: options.merchantConfirmationUrl,
      })
    );
  }}
  // ...
  // ...
/>
```

#### onCheckoutHeightChanged

Called when the checkout's content height changes. Only fires while `isScrollEnabled` is `false`. The
component applies the height itself — implement this only if the host layout also needs to react.

#### onClosePopup

Called when the checkout asks for a popup (child view) to be closed. The SDK closes it itself. This
exists so a host that adapted its own chrome for the popup can undo that.

#### onError

Called when an error occurs in the SDK: load failures, timeouts, parse errors.

Parameters:

- `code` — a stable, machine-readable code (the `QliroOneErrorCode` type)
- `message` — a human-readable description

| `code` | Fatal | Raised when |
| --- | --- | --- |
| `load_failed` | yes | The checkout failed to load (network error, DNS failure, cancelled request) |
| `http_error` | yes | The checkout loaded with an HTTP error status (Android) |
| `checkout_load_timeout` | yes | The checkout did not become `ready` within `loadTimeoutMs` |
| `webview_terminated` | yes | The web view render process was terminated, typically out of memory (Android) |
| `parse_error` | no | A payload from the checkout could not be decoded (Android) |
| `open_url_failed` | no | An external URL, or a BankID/Swish hand-off, could not be opened |

A fatal code means the checkout is unusable and `onStateChanged` has moved to `error`. Recover by
loading the order again. A non-fatal code leaves the checkout interactive. Full contract:
[docs/order-lifecycle.md](docs/order-lifecycle.md).

Use the exported `isFatalError(code)` rather than comparing against codes by hand — a hand-written
check silently starts misclassifying the moment a code is added:

```tsx
import { isFatalError } from '@qliro/react-native-qliro-one';

<QliroOneCheckout
  onError={(code, message) => {
    if (isFatalError(code)) showRetry(message);
  }}
/>;
```

Codes this version of the package does not know return `false`, so a future native code cannot make
your app show a retry screen over something recoverable; `onStateChanged` reaching `'error'` is the
authoritative fatality signal.

#### onLog

Called when the SDK produces a log message.

Parameters:

- `level` — `"debug"`, `"info"`, `"warn"` or `"error"` (the `QliroOneLogLevel` type). `debug`
  requires `isDebugEnabled`
- `message` — the log message

#### onStateChanged

Called when the checkout lifecycle state changes. Both parameters are `QliroOneCheckoutState`:
`"idle"`, `"loading"`, `"ready"`, `"paymentInProgress"`, `"completed"` or `"error"`. The happy path
runs `idle → loading → ready → paymentInProgress → ready → completed`.

#### onTelemetryEvent

Called for lifecycle timing events, with `{ name, durationMs?, metadata? }`. `name` is a
`QliroOneTelemetryEventName`. The events, and which of them carry a `durationMs` or `metadata` are
listed in [docs/order-lifecycle.md](docs/order-lifecycle.md).

#### onApplePayPaymentRequest

Called on iOS when an Apple Pay authorization is requested, before the SDK presents the sheet. An
observability hook — the native SDK builds the payment request itself. Never fires on Android.

### SDK Specific Actions

#### addOrderUpdateCallback and removeOrderUpdateCallback

Initiates and removes the order sync process.

See `onOrderUpdated`

#### lock and unlock

Locks and unlocks the checkout frontend, disabling and re-enabling customer interaction — for
instance while your app updates the order.

See `onOrderUpdated`

#### loadOrderHtml

Loads an order HTML snippet, replacing what the checkout currently shows. Equivalent to updating the
`orderHtml` prop. Use it to refresh an expired session, where the snippet changes but the order does
not. See [docs/session-refresh.md](docs/session-refresh.md).

#### onScroll

If QliroOne is rendered inside a scrollview this function needs to be called on when scrolling to ensure correct positions on popups in the checkout.

Example:

```jsx
<FlatList
  ref={listRef}
  scrollEventThrottle={120}
  onScroll={() => {
    checkoutRef.current?.onScroll();
    // ...
  }}
  data={productsInCart}
  renderItem={({ item }) => (
    //
    // rendering products in cart
    //
  )}
  ListFooterComponent={
    <QliroOneCheckout
        ref={checkoutRef}
        // ...
        // ...
        // ...
      />
  }
/>
```

## Documentation

- [docs/order-lifecycle.md](docs/order-lifecycle.md) — states, telemetry events and error codes,
  shared with the iOS and Android SDKs
- [docs/session-refresh.md](docs/session-refresh.md) — handling the 90-minute session
- [docs/apple-pay-react-native.md](docs/apple-pay-react-native.md) — Apple Pay setup and testing
- [MIGRATION.md](MIGRATION.md) — upgrading from 0.1.x, including the package rename
- [CHANGELOG.md](CHANGELOG.md)
- [docs/releasing.md](docs/releasing.md) — for maintainers: verification, publishing, and the
  deprecation of the old `qliroone_reactnative` name

More information about these callbacks can be found in the [developer portal](https://developers.qliro.com/docs/qliro-one).
