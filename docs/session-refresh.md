# Session refresh (90-minute token)

A Qliro checkout session is valid for **90 minutes**. When it expires, the SDK fires
`onSessionExpired`. Without handling it, the checkout shows an expired state. The host app should
refresh by fetching a **new order HTML snippet** from its backend and reloading the checkout.

`loadOrderHtml(...)` resets the SDK back to the `loading` state and re-runs the load lifecycle
(emitting `checkout_load_started` → `checkout_loaded`), so calling it again is a clean refresh.

## Pattern

1. Register an `onSessionExpired` handler.
2. In it, request a fresh `orderHtmlSnippet` from your backend (same order).
3. Call `loadOrderHtml(newSnippet)`.

### React Native

```tsx
<QliroOneCheckout
  ref={ref}
  orderHtml={orderHtml}
  onSessionExpired={async () => {
    const fresh = await api.refreshOrderSnippet(orderId); // your backend call
    ref.current?.loadOrderHtml(fresh);
    // or update the `orderHtml` prop, which also reloads
  }}
/>
```

### iOS

```swift
func onSessionExpired() {
    api.refreshOrderSnippet(orderId) { [weak self] fresh in
        self?.qliro.loadOrderHtml(html: fresh)
    }
}
```

### Android

```kotlin
override fun onSessionExpired(view: QliroOneCheckout) {
    api.refreshOrderSnippet(orderId) { fresh ->
        view.loadOrderHtml(fresh)
    }
}
```

## Notes

- `onSessionExpired` is **optional**. If you don't register it, the checkout falls back to its
  default expired behavior: a full top-window refresh on web, and on mobile the session simply ends.
- Registering it overrides that default, so you must perform the refresh yourself.
- The new snippet must be for the **same order**. Fetch it the same way you fetched the original
  (`get-order`).
- Observe the refresh via the lifecycle stream: `onStateChanged` → `loading` then `ready`, and the
  `checkout_load_started` / `checkout_loaded` telemetry events.

## How to test

Either let a session sit idle past 90 minutes, or have your backend force-expire the session/token
for a test order, then confirm `onSessionExpired` fires and `loadOrderHtml(fresh)` restores an
interactive checkout.
