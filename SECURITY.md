# Security Policy

The QliroOne React Native SDK renders a payment checkout inside a host application. Security
reports about it are taken seriously and prioritised over feature work.

## Reporting a vulnerability

**Do not open a public issue or merge request for a security problem.**

Email **app@qliro.com** with:

- what the issue is, and which layer it affects (the JavaScript wrapper in `src/`, the Android
  bridge in `android/`, the iOS bridge in `ios/`, or the Expo config plugin)
- the package version, the React Native version, and the platform and OS version you observed it on
- steps to reproduce, ideally a minimal project or a failing test
- the impact you believe it has

If you need to send something sensitive, say so in a first mail and we will arrange an encrypted
channel.

<!-- TODO(team): if Qliro stands up a dedicated security intake address or a bug bounty programme,
     replace app@qliro.com above with it. app@qliro.com is the app team's existing contact — the
     same address used in package.json and by the sibling iOS and Android SDK repos — not a
     monitored security-response mailbox. -->

### What to expect

We will acknowledge your report and tell you whether we can reproduce it. If it is confirmed, we
will agree a disclosure timeline with you, fix it, release, and credit you in the
[CHANGELOG](CHANGELOG.md) unless you would rather stay anonymous.

## Supported versions

Fixes land on the latest minor of the current major. Older majors are not patched — see
[MIGRATION.md](MIGRATION.md) for upgrading.

| Version | Supported |
|---------|-----------|
| 3.x     | Yes       |
| < 3.0   | No        |

`3.0.0` is the first release of `@qliro/react-native-qliro-one`; everything below it was published
under the old `qliroone_reactnative` name, which is deprecated and receives no fixes.

## Scope

In scope:

- the native bridges in `android/` and `ios/`, including how event payloads are parsed and
  forwarded across the React Native bridge
- anything that leaks order, customer or credential data out of the SDK — into a log, a JavaScript
  event payload, or a URL
- the Expo config plugin (`app.plugin.js`, `plugin/`), which writes entries into a host app's
  `Info.plist` and entitlements

Out of scope:

- **the example app under `example/`**, which deliberately holds a *staging* merchant secret and
  signs requests on-device so the demo can run without a backend. This is documented at the top of
  `example/src/qliro.ts` and in [example/README.md](example/README.md). It is a known, intentional
  property of a demo — not a vulnerability. Production integrations must sign server-side.
- findings that require a rooted or jailbroken device, or a malicious host application (the host
  app is already fully trusted by the SDK)
- the checkout web content, the native SDKs' own internals, and the Qliro backend. Report native
  SDK issues to the [iOS](../qliro-one-ios) or [Android](../qliro-one-android) repository, and
  backend issues through [qliro.com](https://www.qliro.com).

## Notes for integrators

- **`isDebugEnabled` controls log verbosity only.** Neither native SDK has a TLS bypass — a
  certificate error on the checkout cancels the load. If a self-signed certificate is blocking a
  test environment, fix the certificate.
- **Never ship a merchant secret in an app.** Sign Qliro merchant API requests on your own server
  and hand the app only the `OrderHtmlSnippet`.
- `onLog` and `onTelemetryEvent` are diagnostic streams. If you forward them to a third-party
  analytics or crash reporting service, treat their contents as potentially containing order data.
