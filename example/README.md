# QliroOne React Native example

The reference integration for `@qliro/react-native-qliro-one`. It creates real orders against Qliro
**staging** and loads them into `<QliroOneCheckout>`, with a live event log so you can watch every
callback fire.

If you are integrating the SDK, [`src/App.tsx`](src/App.tsx) is the file to read — it is a single
screen, and it exercises the whole public surface.

## What it demonstrates

| | |
| --- | --- |
| `useQliroOneCheckout()` | Lifecycle state, last error, and `lock`/`unlock`, wired with one prop spread |
| `isFatalError(code)` | Classifying `onError` codes instead of comparing strings by hand |
| Self-sizing checkout | `isScrollEnabled={false}` plus `onCheckoutHeightChanged` driving the height |
| Nested scrolling | A host `ScrollView` feeding position back via `checkout.ref.current.onScroll(event)` |
| Order sync | `addOrderUpdateCallback` → `onOrderUpdated` → `removeOrderUpdateCallback` + `unlock` |
| Every event prop | Each one appends to the on-screen event log |

The order payload variants (plain, shipping, upsell, …) live in [`src/qliro.ts`](src/qliro.ts) under
`PAYLOADS`, and each is a button in the app.

## Setup

The example is a workspace of the root package, so install from the **repository root**, not here:

```bash
cd ..            # qliro-one-react-native
yarn install
```

### Credentials

The app talks to staging directly and needs merchant credentials, which are not in source:

```bash
cp .env.example .env   # then fill it in
```

Ask the Payments/Checkout team for the staging values. `.env` is gitignored, and
[`.env.example`](.env.example) documents every key.

Metro inlines these at build time, so **restart with `yarn start --reset-cache` after editing
`.env`**. Missing keys are reported at call time rather than failing the build.

> **Not a pattern to copy.** This app holds a merchant secret and signs merchant API requests
> on-device so the demo runs without a backend. That is a staging-only convenience. A production
> integration signs on its own server and hands the app only the `OrderHtmlSnippet`. See
> [SECURITY.md](../SECURITY.md).

You will also need the **Qliro VPN** to reach the staging backend.

## Running

```bash
yarn ios       # or: yarn android
yarn start     # Metro, if it is not already running
```

Both platforms build the SDK from source: `android/settings.gradle` includes
`../../qliro-one-android` as a composite build and substitutes `com.qliro:qliroone` with it, so
there is no `publishToMavenLocal` step and no version to keep in sync. Changes you make in `src/`,
`android/` or `ios/` show up here directly.

### iOS

No Apple Developer account is needed — the Simulator does not code-sign:

```bash
cd ios && bundle exec pod install && cd ..
yarn ios
```

- No `DEVELOPMENT_TEAM` is hardcoded in the Xcode project.
- The entitlements file declares `com.apple.developer.in-app-payments` with an **empty** merchant
  list, so no Apple Pay merchant is configured and nothing needs provisioning.
- `applePayMerchantId` is deliberately not set in `src/App.tsx`, so Apple Pay is off.

On a **physical device**, a free Apple ID works: pick your personal team under Signing &
Capabilities. To turn **Apple Pay** on you need a paid account and a merchant ID — set
`applePayMerchantId` and add the Apple Pay capability, then see
[docs/apple-pay-react-native.md](../docs/apple-pay-react-native.md).

### Android

`react-native run-android` needs the Android SDK location and will not read it from a shell that
does not export it:

```bash
ANDROID_HOME=$HOME/Library/Android/sdk yarn android
```

Use `yarn android` rather than `npx react-native run-android` — the latter resolves outside the
workspace and picks up the wrong CLI.

To watch the JS-side event log from a terminal:

```bash
adb logcat -s ReactNativeJS
```

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Checkout renders blank, height 0 | `isScrollEnabled` is `true`, which suppresses `onCheckoutHeightChanged`. The example keeps it `false` for exactly this reason |
| Missing-env-key errors in the log | `.env` is absent or incomplete — see [Credentials](#credentials) |
| Env changes have no effect | Metro cached the inlined values. `yarn start --reset-cache` |
| Order creation fails or times out | Not on the Qliro VPN, or the staging credentials are wrong |
| `Could not parse autolinking config file` | A stale `android/build/generated/autolinking/` — delete it and rebuild |

## Related

- [README.md](../README.md) — the SDK's API reference
- [docs/order-lifecycle.md](../docs/order-lifecycle.md) — states, telemetry events and error codes
- [docs/session-refresh.md](../docs/session-refresh.md) — handling the 90-minute session
- [docs/apple-pay-react-native.md](../docs/apple-pay-react-native.md) — Apple Pay setup and testing
