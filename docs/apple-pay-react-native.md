# Apple Pay in React Native

Apple Pay runs **iOS only**. The native iOS SDK presents the Apple Pay sheet itself — the RN layer
just passes the merchant ID and (optionally) observes the request. No JS payment code is required.

## How it works

1. The customer taps Apple Pay in the Qliro checkout (web).
2. The checkout asks the SDK to authorize. The **iOS SDK builds the `PKPaymentRequest` and presents
   the Apple Pay sheet natively** using the configured `applePayMerchantId`.
3. Payment lifecycle surfaces to JS via the existing `onPaymentProcessStart` / `onPaymentProcessEnd`
   and `onCompletePurchaseRedirect` callbacks.
4. Optionally, `onApplePayPaymentRequest(paymentData)` fires when authorization is requested (an
   observability hook — you do not need to act on it).

## Setup (required to test)

1. **Apple Pay entitlement** — in the host app's Xcode target: Signing & Capabilities → add
   **Apple Pay**, and add your merchant ID. Equivalent entitlement:
   ```xml
   <key>com.apple.developer.in-app-payments</key>
   <array>
     <string>merchant.com.yourcompany.yourapp</string>
   </array>
   ```
   On **Expo**, pass the merchant ID to the config plugin instead and it writes this entitlement
   for you — see [Expo](../README.md#expo). You still need step 2.
2. **Merchant ID** — register `merchant.…` in the Apple Developer portal and have it enabled/linked
   on the Qliro side for your account.
3. **Pass it to the component:**
   ```tsx
   <QliroOneCheckout
     orderHtml={orderHtml}
     applePayMerchantId="merchant.com.yourcompany.yourapp"
     onApplePayPaymentRequest={(data) => console.log('Apple Pay requested', data)}
     onPaymentProcessStart={() => {/* lock UI */}}
     onPaymentProcessEnd={() => {/* unlock UI */}}
   />
   ```

## Testing on staging

- Use a **real device** (the Apple Pay sheet + payment networks do not work end-to-end in the
  simulator).
- Sign in to a **sandbox Apple Pay tester** account (Settings → Wallet, sandbox tester from App
  Store Connect) and add a sandbox test card.
- Point the app at the staging order flow. The `applePayMerchantId` must match a merchant ID
  enabled for staging.
- Trigger checkout → choose Apple Pay → the native sheet appears → authorize with the sandbox card.

## Notes

- `applePayMerchantId` is already wired through the RN bridge to the native SDK (`updateProps`).
  Leave the prop off when you are not using Apple Pay. Fabric string props default to `""`, so the
  bridge treats an absent prop and an explicitly empty one alike and passes `nil` — which makes the
  SDK report "merchant ID is not configured" rather than failing later on an unusable value.
- The SDK reports Apple Pay diagnostics through `onLog` (verbose output requires `isDebugEnabled`).
  The iOS SDK additionally writes an Apple Pay diagnostic trace to the device console with `NSLog`,
  in release builds too, so a failing payment can be read over USB in Console.app. That trace
  includes the configured merchant ID and payment-request metadata. It never includes the Apple Pay
  payment token or any part of it — only its byte count — because the token carries the payment
  cryptogram.
- Android has no Apple Pay. The `onApplePayPaymentRequest` event never fires there.
