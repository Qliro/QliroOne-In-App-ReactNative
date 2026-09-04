# Qliro SDK — Transparent Order Process

The Qliro mobile SDKs expose a uniform, observable view of the checkout/order lifecycle so
merchants can follow the order process in real time, diagnose issues, and react to state changes.
The contract below is **identical across iOS, Android, and React Native**.

It is delivered through four listener callbacks:

| Callback | Purpose |
|----------|---------|
| `onStateChanged(state, previousState)` | High-level lifecycle state transitions. |
| `onTelemetryEvent(name, durationMs, metadata)` | Timing/diagnostic events. |
| `onError(code, message)` | Recoverable and fatal errors. |
| `onLog(level, message)` | Diagnostic log stream (verbose when `isDebugEnabled`). |

## Lifecycle states

`onStateChanged` reports transitions between these states (string values are stable and identical
on every platform):

| State | Meaning |
|-------|---------|
| `idle` | Initial state, no checkout loaded. |
| `loading` | `loadOrderHtml` called. The checkout is loading. |
| `ready` | Checkout finished loading and is interactive. |
| `paymentInProgress` | A payment/authorization is in progress (UI locked). |
| `completed` | Purchase completed (redirect to the merchant confirmation). |
| `error` | A fatal error occurred (see the matching `onError`). |

Typical happy-path sequence: `idle → loading → ready → paymentInProgress → ready → completed`.

## Telemetry events

`onTelemetryEvent` carries an event `name`, an optional `durationMs`, and optional `metadata`:

| Event | `durationMs` | `metadata` |
|-------|--------------|-----------|
| `checkout_load_started` | — | — |
| `checkout_loaded` | time from load start to ready | — |
| `payment_process_started` | — | — |
| `payment_process_ended` | time from payment start to end | — |
| `payment_declined` | — | `declineReason`, `declineReasonMessage` |
| `session_expired` | — | — |
| `purchase_completed` | — | — |
| `checkout_error` | — | `code`, `message` |

## Error codes

`onError(code, message)` uses a stable code taxonomy. Both native SDKs have a `QliroOneErrorCode`
enum, and these strings are its `value`. The code handed to the iOS listener and forwarded across
the React Native bridge is that string. Map a string back with `QliroOneErrorCode(value:)` on iOS
or `QliroOneErrorCode.fromValue()` on Android.

| Code | Fatal | Cause |
|------|-------|-------|
| `load_failed` | yes | WebView navigation/load failure. |
| `http_error` | yes | Non-success HTTP status for the main frame (Android). |
| `checkout_load_timeout` | yes | Checkout did not reach `ready` within `loadTimeoutMs`. |
| `webview_terminated` | yes | The WebView render process was terminated (Android). |
| `parse_error` | no | A malformed payload was received from the checkout (Android). |
| `open_url_failed` | no | An external URL, or a BankID/Swish hand-off, could not be opened. |
| `untrusted_origin` | no | The SDK refused something that did not come from, or was not addressed to, a Qliro origin (iOS). |

`untrusted_origin` is raised by the iOS SDK only, because only it surfaces these refusals as a
distinct code today. It covers four refusals, and the message says which: a `message` event from a
frame that is not Qliro's, an Apple Pay `proceedUrl`/`validateMerchantUrl` on a host outside Qliro's
domains, a main-frame navigation away from the checkout, and a hand-off to an app scheme the SDK
does not know (widen that last one with `QliroOneCheckout.additionalAllowedUrlSchemes`). The message
never carries the offending URL's path or query — those can hold session identifiers and BankID
autostart tokens. The Android SDK enforces an equivalent allowlist (http/https only for popup
hand-offs, package-pinned BankID/Swish) and reports refusals through `onLog` warnings instead. If
Android later surfaces its refusals as a code, it must use this same string.

Fatality is a property of the code, not of the platform or of the emit site, and both native SDKs
expose it as `QliroOneErrorCode.isFatal`:

- **Fatal** — the checkout itself is unusable. The SDK emits an error-level `onLog` and a
  `checkout_error` telemetry event, transitions the state to `error`, and then calls `onError`.
  Recover by reloading (`reload()` on Android) or by creating a new order.
- **Non-fatal** — one operation failed while the checkout stays interactive: a BankID hand-off to
  an app that is not installed, a payload the SDK could not decode. Only
  `onError` fires. The state is left untouched, and the customer can carry on (for example by
  picking another payment method).

A fatal error is not necessarily permanent — `error` is an ordinary state to recover from, not the
end of the lifecycle: `error → loading → ready` is a normal sequence after a reload.

## Log levels

`onLog(level, message)` uses: `debug`, `info`, `warn`, `error`. `debug` messages are only emitted
when `isDebugEnabled` is set on the checkout instance.

## Configuration

| Property | Default | Purpose |
|----------|---------|---------|
| `isDebugEnabled` | `false` | Enables verbose `debug`-level logging. Logging only — no effect on TLS certificate validation on any platform. |
| `loadTimeoutMs` | `30000` | Milliseconds to wait for `ready` before emitting `checkout_load_timeout`. `0` disables. |

## Platform notes

- **Android** is the reference implementation (`QliroOneListener`, `CheckoutState`).
- **iOS**: callbacks are `@objc optional` on `QliroOneListener`. `checkoutState` is a readable
  property. `CheckoutState.value` exposes the string identifier.
- **React Native**: callbacks are component event props. `isDebugEnabled` and `loadTimeoutMs`
  are props.
