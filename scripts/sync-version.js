#!/usr/bin/env node
/*
 * Single source of truth for the React Native SDK version is package.json.
 * This stamps that version into the native bridges so the value reported to the
 * Qliro backend can never drift between package.json, iOS, and Android.
 * Runs automatically on `prepare` (before `bob build`).
 */
const fs = require('node:fs');
const path = require('node:path');
const { version } = require('../package.json');

const targets = [
  {
    file: path.join(__dirname, '../ios/QliroOneCheckout.mm'),
    regex: /(initWithReactNativeSDKVersion:@")[^"]*(")/,
  },
  {
    file: path.join(
      __dirname,
      '../android/src/main/java/com/qliroonereactnative/QliroOneCheckoutView.kt'
    ),
    regex: /(QliroOneCheckout\(context, null, ")[^"]*(")/,
  },
];

let ok = true;
for (const { file, regex } of targets) {
  const src = fs.readFileSync(file, 'utf8');
  if (!regex.test(src)) {
    console.error(`sync-version: pattern not found in ${path.basename(file)}`);
    ok = false;
    continue;
  }
  const next = src.replace(regex, `$1${version}$2`);
  if (next !== src) {
    fs.writeFileSync(file, next);
    console.log(`sync-version: ${path.basename(file)} -> ${version}`);
  } else {
    console.log(`sync-version: ${path.basename(file)} already ${version}`);
  }
}

process.exit(ok ? 0 : 1);
