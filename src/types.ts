import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * The `(string & {})` arm on the unions below keeps them *open*.
 *
 * A closed union would be a breaking change every time a native SDK adds a value: the string would
 * arrive at runtime regardless, but merchants compiling against an older copy of this package would
 * get a type error they cannot fix. The `(string & {})` arm accepts any string while still letting
 * TypeScript offer the known values in autocomplete — `string` alone would erase the suggestions,
 * which is the whole point of narrowing these.
 *
 * Every value is cross-checked against the two native SDKs rather than the documentation:
 * `../qliro-one-android/qliroone/src/main/java/com/qliro/qliroone/enums/` and
 * `../qliro-one-ios/QliroOne/Classes/enums/`.
 */
type OpenUnion = string & {};

/**
 * Levels the SDK emits through {@link QliroOneCheckoutProps.onLog}. `debug` requires
 * `isDebugEnabled`.
 */
export type QliroOneLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * The checkout lifecycle states reported by {@link QliroOneCheckoutProps.onStateChanged}.
 *
 * The happy path runs `idle → loading → ready → paymentInProgress → ready → completed`. `error` is
 * recoverable rather than terminal — reloading the order returns the checkout to `loading`. The
 * values are identical on iOS and Android; see `docs/order-lifecycle.md`.
 */
export type QliroOneCheckoutState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'paymentInProgress'
  | 'completed'
  | 'error';

/**
 * The machine-readable codes reported through {@link QliroOneCheckoutProps.onError}.
 *
 * These are the `value` strings of `QliroOneErrorCode` in both native SDKs — the stable wire form,
 * which survives an enum constant being renamed. Use {@link isFatalError} rather than comparing
 * against codes by hand.
 *
 * @see {@link isFatalError}
 * @see `docs/order-lifecycle.md`
 */
export type QliroOneErrorCode =
  /** The checkout failed to load: network error, DNS failure, cancelled request. Fatal. */
  | 'load_failed'
  /** The checkout's main frame loaded with an HTTP error status. Fatal. */
  | 'http_error'
  /** The checkout did not reach `ready` within `loadTimeoutMs`. Fatal. */
  | 'checkout_load_timeout'
  /** The web view render process was terminated, typically out of memory. Fatal. */
  | 'webview_terminated'
  /** A payload from the checkout could not be decoded; one callback was dropped. Not fatal. */
  | 'parse_error'
  /** An external URL, or a BankID/Swish hand-off, could not be opened. Not fatal. */
  | 'open_url_failed'
  /**
   * A message or URL was refused because it did not come from a trusted Qliro origin. Not fatal.
   *
   * iOS only. The Android SDK enforces the equivalent allowlists without surfacing a distinct code.
   */
  | 'untrusted_origin'
  | OpenUnion;

/**
 * The codes for which the checkout itself is unusable.
 *
 * Kept as a `Set` of the wire strings so {@link isFatalError} is a lookup rather than a chain of
 * comparisons, and so the fatal/non-fatal split lives in exactly one place.
 */
const FATAL_ERROR_CODES: ReadonlySet<string> = new Set([
  'load_failed',
  'http_error',
  'checkout_load_timeout',
  'webview_terminated',
]);

/**
 * Whether an {@link QliroOneCheckoutProps.onError} code means the checkout is unusable.
 *
 * Fatality is a property of the code, not of the platform or the emit site — both native SDKs
 * expose the same split as `QliroOneErrorCode.isFatal`, and this mirrors it so integrations stop
 * hand-writing `code !== 'parse_error' && code !== 'open_url_failed'` checks that silently go stale
 * when a code is added.
 *
 * - **Fatal** — recover by loading the order again. `onStateChanged` has already moved to `error`.
 * - **Not fatal** — one operation failed; the checkout stays interactive and the customer can
 *   carry on, for instance by picking another payment method.
 *
 * Codes this version of the package does not know return `false`, so a future native code cannot
 * make an integration show a retry screen over something recoverable. `onStateChanged` reaching
 * `'error'` is the authoritative fatality signal and is not subject to that caveat.
 *
 * @param code - The code handed to `onError`
 * @returns Whether the checkout is unusable
 *
 * @example
 * ```tsx
 * <QliroOneCheckout
 *   onError={(code, message) => {
 *     if (isFatalError(code)) showRetry(message);
 *   }}
 * />
 * ```
 */
export function isFatalError(code: QliroOneErrorCode): boolean {
  return FATAL_ERROR_CODES.has(code);
}

/**
 * Optional modules on the result ("thank you") page that
 * {@link QliroOneCheckoutProps.excludedResultModules} can hide.
 *
 * These are the `Module` enum names in both native SDKs, which is also their wire form. Names that
 * neither SDK recognizes are dropped with a warning through `onLog` rather than failing the call.
 */
export type QliroOneResultModule =
  /** The "Thank you for your purchase" header. */
  | 'HEADER'
  /** The total price and order summary. */
  | 'TOTAL_PRICE'
  /** The customer contact details and address used in the purchase. */
  | 'CUSTOMER_DETAILS'
  /** The selected shipping method. Only shown when Qliro One handled the shipping. */
  | 'SHIPPING_METHOD'
  | OpenUnion;

/**
 * The lifecycle timing events reported through {@link QliroOneCheckoutProps.onTelemetryEvent}.
 *
 * Both native SDKs emit exactly these names; see `docs/order-lifecycle.md` for which carry a
 * `durationMs` and which carry `metadata`.
 */
export type QliroOneTelemetryEventName =
  /** `loadOrderHtml` was called and the checkout began loading. */
  | 'checkout_load_started'
  /** The checkout became interactive. Carries `durationMs` since the load started. */
  | 'checkout_loaded'
  /** A payment/authorization began. */
  | 'payment_process_started'
  /** A payment/authorization ended. Carries `durationMs` since it started. */
  | 'payment_process_ended'
  /** A payment was declined. Carries `declineReason` and `declineReasonMessage` metadata. */
  | 'payment_declined'
  /** The 90-minute checkout session expired. */
  | 'session_expired'
  /** The purchase completed. */
  | 'purchase_completed'
  /** A fatal error occurred. Carries `code` and `message` metadata. */
  | 'checkout_error'
  | OpenUnion;

/** A telemetry event as delivered to {@link QliroOneCheckoutProps.onTelemetryEvent}. */
export interface QliroOneTelemetryEvent {
  name: QliroOneTelemetryEventName;
  durationMs?: number;
  metadata?: Record<string, string>;
}

/** An error as delivered to {@link QliroOneCheckoutProps.onError}. */
export interface QliroOneError {
  code: QliroOneErrorCode;
  message: string;
}

export interface QliroOneCheckoutRef {
  /**
   * Lock the checkout and disable user interaction.
   */
  lock: () => void;
  /**
   * Unlock the checkout and enable user interaction.
   */
  unlock: () => void;
  /**
   * Starts the order sync process: the checkout locks, and `onOrderUpdated` reports the order as
   * Qliro One holds it, possibly several times, until you stop it.
   */
  addOrderUpdateCallback: () => void;
  /**
   * Stops the order sync process. Pair it with `unlock` so the customer can continue.
   */
  removeOrderUpdateCallback: () => void;
  /**
   * If the component is rendered inside a scrollview this function should be called on when scrolling in the view to ensure the popups get postioned correctly
   */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /**
   * Loads an order HTML snippet, replacing whatever the checkout currently shows.
   *
   * Equivalent to updating the `orderHtml` prop; use it when refreshing an expired session, where
   * the snippet changes but the order does not.
   *
   * @param html - The order HTML snippet from `getOrder`
   */
  loadOrderHtml: (html: string) => void;
  /**
   * When enabled, Qliro One will scroll to the selected payment or shipping option after a customer have chosen one in the expanded list. (default: false)
   * @param enabled - Whether to enable scrolling
   */
  enableCheckoutScrolling: (enabled: boolean) => void;
  /**
   * Used to exclude optional modules from displaying on the result page (thank you page).
   * @param modules - An array of modules to exclude
   */
  excludeResultModules: (modules: QliroOneResultModule[]) => void;
}
