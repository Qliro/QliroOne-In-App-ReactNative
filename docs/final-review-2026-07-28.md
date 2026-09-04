
---

## Still open (as of 2026-07-29)

Everything above was implemented and verified except the following, each of which needs a decision
rather than an implementation.

### Needs a product decision
- **iOS platform floor.** Still swift-tools 5.7 / iOS 12. Raising to iOS 15 + tools 6.0 drops merchant
  devices, so it was left alone. It blocks two WebKit-enforced hardening APIs that would sit *underneath*
  the allowlists now implemented in Swift — `limitsNavigationsToAppBoundDomains` and `contentWorld`-isolated
  message handlers. Both are commented in-code at the exact point they would go. Swift Concurrency
  (`@MainActor`/`Sendable`) is blocked on the same decision.
- **iOS SPM distribution.** The README's SPM snippet still cannot work: the git remote is internal, and the
  public `github.com/Qliro/QliroOne-In-App` mirror ships only the prebuilt XCFramework and podspec — no
  `Package.swift`. SwiftPM support is currently a manifest that builds and that nobody can depend on.
  Shipping it means either mirroring sources publicly or publishing a `binaryTarget` manifest. The snippet
  now carries a warning block instead of an invented URL.
- ~~**RN package rename** (`qliroone_reactnative` → `@qliro/react-native-qliro-one`)~~ — **done.** Landed
  for the 3.0 release train. The old name is published, so the cutover is a migration: see
  [releasing.md](releasing.md#deprecating-the-old-package-name) for the `npm deprecate` step that has to
  run after the first scoped release, and [MIGRATION.md](../MIGRATION.md) for what merchants change.

### Blocked on the release train
- **RN native version pins** (iOS `3.0.0`, Android `3.0.0`) and the `build-ios` `allow_failure: true`
  that exists because of them. Unblocked once both natives publish 3.0.0. See `release-checklist.md`.

### Small, worth picking up
- ~~The new RN Kotlin test has never been executed~~ — **executed 2026-07-29** on this machine:
  `:qliro_react-native-qliro-one:testDebugUnitTest` from `example/android` runs
  `QliroOneCheckoutViewScrollingTest`, 4 tests, 0 failures, against the real native SDK via the
  composite build. The autolinked module name is confirmed as `:qliro_react-native-qliro-one`.
  Still not wired into CI.
- **XCFramework signing is implemented but unverified** — `create_xcframework.sh` now signs via
  `QLIRO_SIGNING_IDENTITY`, and both the unset and bad-identity branches were tested, but no real
  certificate was available. Verify on a machine with the distribution identity, and fill in the
  `<TEAM_ID>` TODO in the README.
- **`SECURITY.md` contacts are `app@qliro.com`** in all three repos, with a marked TODO: that is the app
  team's general address, not a monitored security mailbox. Same for the `CODEOWNERS` TODOs, which list
  real committers rather than a guessed GitLab group handle.
- **The `untrusted_origin` error code is iOS-only.** Added there for the Apple Pay origin refusals and
  mirrored into the RN type union as iOS-only. If Android later surfaces its allowlist refusals as a
  distinct code, use the same string and update `order-lifecycle.md` in all three repos.
- **Top-level `docs/` is still in no git repository.** Unchanged from the original finding.
- **`qliro-one-hats` still has no git remote.** It now has a README. It still exists only on one laptop.
