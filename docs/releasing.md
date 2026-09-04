# Maintaining and releasing the React Native SDK

For SDK maintainers. Integrators want the [README](../README.md) and [MIGRATION.md](../MIGRATION.md).

Ordering against the native SDKs is not covered here — the natives must be released first, and that
sequence lives in the suite-level `release-checklist.md`.

## Before you release

```bash
yarn typecheck
yarn lint
yarn test --coverage
yarn prepare
```

`yarn prepare` runs `scripts/sync-version.js` and then `bob build`. The sync script stamps
`package.json`'s `version` into both native bridges (`ios/QliroOneCheckout.mm` and
`android/.../QliroOneCheckoutView.kt`) so the version reported to the Qliro backend cannot drift from
the published one. It is the only thing that writes those strings — never edit them by hand.

Coverage thresholds are in `package.json` under `jest.coverageThreshold`, so a drop fails the run
rather than only showing up in the report.

Check what actually ships:

```bash
npm pack --dry-run
```

The `files` array is an allowlist, so a new top-level directory is excluded until it is added there.
Confirm `LICENSE`, the `lib/` build output, `app.plugin.js` and `plugin/` are all present, and that
`example/` and the test directories are not.

## Versioning and publishing

`package.json`'s `version` is the single source of truth; `release-it` drives the tag, the changelog
and the npm publish.

The first release under the new name is **3.0.0**, renumbered from the `0.2.0-dev` line so the
wrapper carries the same version as the iOS and Android SDKs in the 3.0 release train. There is no
`@qliro/react-native-qliro-one` 1.x or 2.x and nothing shipped between `0.2.0-dev.7` and it.

Three unrelated numbers live in this repo — do not conflate them:

| Number | Where | What it is |
| --- | --- | --- |
| `3.0.0` | `package.json` `version` | the npm package's own version, stamped into both bridges by `scripts/sync-version.js` |
| `3.0.0` | `QlirooneReactnative.podspec` `s.dependency "QliroOne"` | the iOS native SDK this wrapper pins |
| `3.0.0` | `android/gradle.properties` `..._qliroOneVersion` | the Android native SDK this wrapper pins |

The Android pin currently resembles the package version by coincidence. Bumping the package version
does not bump either native pin, and vice versa. The pins move when the native repos publish.

```bash
yarn release           # a normal release
yarn release:dev       # a pre-release on the `dev` dist-tag
```

There is no publish job in CI — releases are cut by hand from a clean checkout on `main`.

### The package is scoped

The package name is `@qliro/react-native-qliro-one`. npm defaults a **scoped** package to restricted
access and will reject the publish of a scoped package the account cannot publish privately, so
`package.json` carries:

```json
"publishConfig": { "access": "public" }
```

Do not remove it. Without it the first publish of any new scoped package in this scope fails with
`402 Payment Required` (or publishes privately, which is worse — merchants get a 404 on install).

### Where `homepage`, `bugs` and `repository` point

These are baked into the published npm metadata and rendered on the package page, so they were
settled before the first `@qliro/react-native-qliro-one` publish.

```json
"bugs":       { "email": "app@qliro.com" },
"homepage":   "https://developers.qliro.com/docs/qliro-one",
"repository": { "type": "git", "url": "git+https://github.com/Qliro/QliroOne-In-App-ReactNative.git" }
```

- **`homepage`** is the public [Qliro developer portal](https://developers.qliro.com/docs/qliro-one).
  It is the documentation merchants are already sent to — this repo's own docs link it throughout —
  so it is the page an integrator clicking through from npm actually wants.
- **`bugs` uses the email form, not a URL.** There is no public issue tracker for this SDK: GitLab is
  internal and merchants cannot open an issue there. npm renders `bugs.email` as a mailto link and
  `npm bugs` opens the mail client, so an address is both honest and functional, where a URL to an
  unreachable tracker would not be.

  <!-- TODO(team): if Qliro stands up a dedicated merchant-support or security intake address,
       replace app@qliro.com above with it. app@qliro.com is the app team's existing contact — the
       same address used in package.json's `author` and by the sibling iOS and Android SDK repos —
       not a monitored merchant-support mailbox. The same TODO is in SECURITY.md. -->

- **`repository` points at the public snapshot mirror**,
  [github.com/Qliro/QliroOne-In-App-ReactNative](https://github.com/Qliro/QliroOne-In-App-ReactNative).
  It must never point at `qliro.gitlab.host`: that host is behind the corporate network, and a
  repository link that 404s for every merchant is worse than none. The mirror keeps the link public
  and feeds the supply-chain tooling (socket.dev, deps.dev, Snyk) that scores packages by their
  repository provenance.

### The snapshot mirror

The GitHub mirror is **read-only distribution, not development**: development happens on
`qliro.gitlab.host`, issues are triaged through `app@qliro.com`, and the mirror's issues and PRs are
disabled. Its content is a source snapshot taken at each release.

Pushing the snapshot is part of cutting a release. From a clean checkout of the released commit:

```bash
git clone git@github.com:Qliro/QliroOne-In-App-ReactNative.git /tmp/rn-mirror
rsync -a --delete --exclude '.git' --exclude 'node_modules' --exclude 'example/node_modules' \
  --exclude '.yarn' ./ /tmp/rn-mirror/
cd /tmp/rn-mirror
git add -A && git commit -m "Release <version>" && git tag v<version> && git push origin HEAD --tags
```

A stale mirror misleads worse than no mirror — if the push step is ever dropped, archive the GitHub
repository with a pointer README instead of leaving it live.

## Deprecating the old package name

**Background.** This package was published as `qliroone_reactnative` before the 3.0 release train —
latest `0.1.22`, with a `dev` dist-tag at `0.2.0-dev.7` (the pre-rename version line this repo was on
before it was renumbered to 3.0.0). Merchants may already depend on that name, so the rename is a
migration and not a free rename. The old package is left on npm. It is deprecated so
that existing installs keep resolving while every new install is pointed here.

**Never unpublish `qliroone_reactnative`.** Unpublishing breaks the lockfile of every merchant who
already depends on it, and npm will not let the name be reused afterwards.

Run these **after** the first `@qliro/react-native-qliro-one` release is live on npm, not before — the
deprecation notice tells people to install a package, so that package has to exist first.

1. Confirm the new package published and installs:

   ```bash
   npm view @qliro/react-native-qliro-one version
   ```

2. Deprecate every version of the old name:

   ```bash
   npm deprecate qliroone_reactnative "Renamed to @qliro/react-native-qliro-one"
   ```

   With no version range this applies to all published versions, which is what we want — no 0.1.x
   release is getting further work. It requires a publish token for the old package, and it is
   reversible: `npm deprecate qliroone_reactnative@"*" ""` clears the notice.

3. Verify the notice is attached:

   ```bash
   npm view qliroone_reactnative deprecated
   ```

   Installing the old name should now print the message. The install still succeeds — `npm deprecate`
   is advisory, which is the point.

4. Retire the old `dev` dist-tag so nobody follows it onto a dead package:

   ```bash
   npm dist-tag rm qliroone_reactnative dev
   ```

   `latest` cannot be removed and should be left pointing at `0.1.22`.

Anything published under `qliroone_reactnative` stays frozen at `0.1.22` forever. If a security fix
has to reach 0.1.x merchants, it ships under the new name and the advisory tells them to migrate —
publishing a new version of a deprecated package sends a confusing signal and re-establishes it as
maintained.

### What the rename did not touch

The npm name is the only public identifier that changed. These are internal and stayed as they were,
because merchants never type them and moving them is a much larger, riskier change:

- the CocoaPods podspec, `QlirooneReactnative.podspec`, and the pod name inside it
- the Android Gradle namespace and Kotlin package, `com.qliroonereactnative`
- the codegen spec name, `QliroOneCheckoutSpec`, and the iOS generated class `RNQliroOneCheckout`

One name *is* derived from `package.json` and moved on its own: React Native autolinking builds the
example app's Gradle module name from the package name, so `:qliroone_reactnative` became
`:qliro_react-native-qliro-one`. Nothing hardcodes it — read it from
`example/android/build/generated/autolinking/autolinking.json` if you need it for a Gradle
invocation.

## Documentation sweep

- `CHANGELOG.md` — move `[Unreleased]` to the new version with a date.
- `MIGRATION.md` — anything a merchant must change, including the rename steps.
- `README.md` — install snippets and the Expo plugin entry must name the published package.
- `docs/order-lifecycle.md` — shared verbatim with the iOS and Android repos. A change to the state
  machine, the error codes or the telemetry event names is a change to all three.
