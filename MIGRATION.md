# Migrating to `@qliro/react-native-qliro-one` 3.0.0

For integrations on `qliroone_reactnative` 0.1.x. Two things change at once: **the package is
renamed**, and the component becomes a Fabric component, so the host app must run React Native's New
Architecture. The component keeps the same shape — `<QliroOneCheckout>` with an imperative ref — but a
handful of signatures changed.

Everything in [CHANGELOG.md](CHANGELOG.md) applies. This guide is the subset that requires action.

## About the version number

`3.0.0` is the **first release under the new name** — despite the number, there is no
`@qliro/react-native-qliro-one` 1.x or 2.x, and nothing was published between `qliroone_reactnative`
0.1.22 and this. The wrapper is renumbered to line up with the QliroOne iOS and Android SDKs, which
both go to 3.0.0 in the same release train, so a merchant integrating on all three platforms sees one
version number instead of three unrelated ones. Read it as "the 3.0 train", not as two majors of
history you missed.

The number the wrapper pins its *native* SDKs to is a separate thing and is declared in
`QlirooneReactnative.podspec` and `android/gradle.properties`. You do not set it.

## Breaking change: the package is renamed

`qliroone_reactnative` is now **`@qliro/react-native-qliro-one`**, shipping with the 3.0 release
train. The old name is unscoped and snake_case, which matched nothing else in the suite. The scoped
name also keeps the package from being typosquatted. Only the npm name changes — the component, the
props and the native identifiers are untouched.

The old package stays on npm at its last 0.1.x release and is deprecated, so `yarn add
qliroone_reactnative` keeps working but prints a notice pointing here. It receives no further
releases.

### 1. Swap the dependency

```bash
# yarn
yarn remove qliroone_reactnative
yarn add @qliro/react-native-qliro-one

# npm
npm uninstall qliroone_reactnative
npm install @qliro/react-native-qliro-one
```

Do the removal and the install as separate steps. Leaving both in `package.json` installs two copies
of the native module and autolinking then registers the `QliroOneCheckout` view twice.

### 2. Update every import

Every specifier changes. Nothing inside the braces does.

```tsx
// before
import { QliroOneCheckout, type QliroOneCheckoutRef } from 'qliroone_reactnative';

// after
import { QliroOneCheckout, type QliroOneCheckoutRef } from '@qliro/react-native-qliro-one';
```

To find them all:

```bash
grep -rn "qliroone_reactnative" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
```

### 3. Update the Expo config plugin entry, if you use one

```json
{
  "expo": {
    "plugins": [["@qliro/react-native-qliro-one", { "applePayMerchantId": "merchant.com.yourcompany.yourapp" }]]
  }
}
```

### 4. Reinstall the native dependencies

A scoped package installs to `node_modules/@qliro/react-native-qliro-one`, so anything holding the
old path has to be regenerated:

- **iOS** — `bundle exec pod install` (from `ios/`). If your `Podfile` names the pod by path rather
  than relying on autolinking, update the path to `../node_modules/@qliro/react-native-qliro-one`.
  The pod itself is still called `QlirooneReactnative`.
- **Android** — no manual step: autolinking derives the Gradle module from `package.json`. Run a
  clean build (`cd android && ./gradlew clean`) so the stale autolinking cache is dropped.
- **Expo** — `npx expo prebuild --clean`.

## Requirement: the New Architecture

3.0.0 is a Fabric component with codegen-generated native interfaces. It does not work on the legacy
(Paper) renderer, so the host app needs `newArchEnabled=true` on Android and
`RCT_NEW_ARCH_ENABLED=1` at `pod install` time on iOS. Practically that means React Native 0.76 or
later, where the New Architecture is the default.

0.1.x, by contrast, drove the native view through `UIManager.dispatchViewManagerCommand`, which the
New Architecture removed.

## Other breaking changes

### The ref type is `QliroOneCheckoutRef`

The component was a class. It is now a function component with `forwardRef`, so the ref's type is the
handle interface rather than the component:

```tsx
// 0.1.x
const checkoutRef = useRef<QliroOneCheckout>(null);

// 3.0.0
import { QliroOneCheckout, type QliroOneCheckoutRef } from '@qliro/react-native-qliro-one';
const checkoutRef = useRef<QliroOneCheckoutRef>(null);
```

The methods on it — `lock`, `unlock`, `addOrderUpdateCallback`, `removeOrderUpdateCallback`,
`loadOrderHtml`, `enableCheckoutScrolling`, `excludeResultModules`, `onScroll` — keep their names.

### `onScroll` takes the scroll event

It used to take the two values it needed. Now hand it the event and the component reads them:

```tsx
// 0.1.x
onScroll={(e) => checkoutRef.current?.onScroll(
  e.nativeEvent.layoutMeasurement.height,
  e.nativeEvent.contentOffset.y,
)}

// 3.0.0
onScroll={(e) => checkoutRef.current?.onScroll(e)}
```

The component also throttles the forwarding, which 0.1.x left to the caller.

### Modules are plain strings

The `Module` enum is gone from the public API. The `excludedResultModules` prop and the
`excludeResultModules` ref method take `string[]`:

```tsx
// 0.1.x
excludedResultModules={[Module.HEADER, Module.TOTAL_PRICE]}

// 3.0.0
excludedResultModules={['HEADER', 'TOTAL_PRICE']}
```

The accepted names are `"HEADER"`, `"TOTAL_PRICE"`, `"CUSTOMER_DETAILS"` and `"SHIPPING_METHOD"`,
exported as the `QliroOneResultModule` type so they still autocomplete. Unrecognized names are
ignored rather than rejected.

### `onLogged` is replaced by `onLog`

```tsx
// 0.1.x
onLogged={(message) => console.log(message)}

// 3.0.0
onLog={(level, message) => console.log(level, message)}
```

`level` is `'debug' | 'info' | 'warn' | 'error'` (exported as `QliroOneLogLevel`); `debug` messages
require `isDebugEnabled`. In 0.1.x `onLogged` was declared but never wired to anything, so nothing
was arriving on it — expect to start seeing messages once you switch.

## No change needed

- **Shipping prices.** The native SDKs widened these from integers to doubles, but both were already
  `number` in TypeScript, so `onShippingPriceChanged` is unaffected.
- **Every other event prop** keeps its name and signature: `onCheckoutLoaded`,
  `onCustomerInfoChanged`, `onCustomerDeauthenticating`, `onPaymentMethodChanged`,
  `onPaymentDeclined`, `onPaymentProcessStart`, `onPaymentProcessEnd`, `onShippingMethodChanged`,
  `onSessionExpired`, `onOrderUpdated`, `onCompletePurchaseRedirect`.
- **`orderHtml`, `isScrollEnabled`, `isCheckoutScrollEnabled`, `applePayMerchantId`** are unchanged.

## What you gain

### An observability API

```tsx
import { isFatalError } from '@qliro/react-native-qliro-one';

<QliroOneCheckout
  onStateChanged={(state, previousState) => track(state, previousState)}
  onTelemetryEvent={({ name, durationMs }) => track(name, durationMs)}
  onLog={(level, message) => log(level, message)}
  onError={(code, message) => {
    if (isFatalError(code)) showRetry();
  }}
/>;
```

Prefer `isFatalError(code)` over comparing against codes by hand — a hand-written
`code !== 'parse_error' && code !== 'open_url_failed'` silently starts misclassifying the moment a
new code is added.

The states, telemetry event names and error codes are identical on iOS and Android:
[docs/order-lifecycle.md](docs/order-lifecycle.md). Each is a named type —
`QliroOneCheckoutState`, `QliroOneTelemetryEventName`, `QliroOneErrorCode`, `QliroOneLogLevel` —
so your editor suggests the valid values.

### New props and events

| Added | Purpose |
| --- | --- |
| `isDebugEnabled` | Verbose `debug` logging through `onLog`. Never enable in production |
| `loadTimeoutMs` | Bounds how long a load may take before `onError('checkout_load_timeout')`. Default `30000`, `0` disables |
| `style` | A `ViewStyle` for the component's container |
| `onCheckoutHeightChanged` | The content height, while `isScrollEnabled` is `false` |
| `onClosePopup` | The checkout asked for a popup to be closed |
| `onApplePayPaymentRequest` | An Apple Pay authorization was requested (iOS only) |

### Apple Pay on iOS

Set `applePayMerchantId` and the native SDK presents the Apple Pay sheet itself — no JS payment code.
See [docs/apple-pay-react-native.md](docs/apple-pay-react-native.md) for the entitlement and testing
setup.

### Session refresh

`onSessionExpired` now has a documented refresh path: fetch a new snippet for the same order and
either update `orderHtml` or call `loadOrderHtml` on the ref. See
[docs/session-refresh.md](docs/session-refresh.md).

### Android parity fixes

`onOrderUpdated`'s `order.orderItems` and `onShippingMethodChanged`'s
`shipping.additionalShippingServices` now arrive populated on Android, where they previously came
through as `undefined`.

### Android result-module exclusion

`excludedResultModules` and the `excludeResultModules` ref method now take effect on Android too.
In 0.1.x the Android bridge logged the call without forwarding it to the native SDK, so result-page
modules were silently not excluded there. Both platforms now behave the same. If you built a
workaround that hides those modules yourself on Android, remove it.
