import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import QliroOneCheckoutNativeComponent, {
  Commands,
  type Customer,
  type DeclineReason,
  type PaymentMethod,
  type PurchaseRedirectOptions,
} from './QliroOneCheckoutNativeComponent';
import type {
  QliroOneCheckoutRef,
  QliroOneCheckoutState,
  QliroOneErrorCode,
  QliroOneLogLevel,
  QliroOneResultModule,
  QliroOneTelemetryEvent,
  QliroOneTelemetryEventName,
} from './types';

/**
 * Documented in README.md and docs/order-lifecycle.md as the `loadTimeoutMs` default.
 *
 * Applied here rather than left to each native SDK's own default: forwarding `undefined` made the
 * documented value true only as long as both natives happened to agree, and a drift between them
 * would silently make the documentation wrong on one platform. One source of truth instead.
 */
const DEFAULT_LOAD_TIMEOUT_MS = 30000;

/**
 * Props accepted by {@link QliroOneCheckout}.
 *
 * Extends `ViewProps`: anything not listed below is passed straight through to the wrapper view, so
 * `testID`, `accessibilityLabel`, `nativeID`, `pointerEvents` and the rest behave as they would on
 * any `View`. That is what lets Detox/Maestro suites target the checkout screen.
 */
export interface QliroOneCheckoutProps extends ViewProps {
  /**
   * orderHtmlSnippet returned from the order response used to load the checkout.
   */
  orderHtml?: string;

  /**
   * Apple Pay merchant identifier for payment processing
   */
  applePayMerchantId?: string;

  /**
   * Set to true to enable scroll, otherwise the checkout will size itself after its content.
   * This should not be set to true if you are nesting the checkout inside of another scrollview.
   */
  isScrollEnabled?: boolean;

  /**
   * Used to exclude optional modules from displaying on the result page (thank you page).
   *
   * Accepts `"HEADER"`, `"TOTAL_PRICE"`, `"CUSTOMER_DETAILS"` and `"SHIPPING_METHOD"`; unrecognized
   * names are ignored.
   */
  excludedResultModules?: QliroOneResultModule[];

  /**
   * When enabled, Qliro One will scroll to the selected payment or shipping option after a customer have chosen one in the expanded list. (default: false)
   * This have no effect when isScrollEnabled is true.
   */
  isCheckoutScrollEnabled?: boolean;

  /**
   * When true, the SDK emits verbose debug-level logs via onLog. Never enable in production.
   */
  isDebugEnabled?: boolean;

  /**
   * Milliseconds to wait for the checkout to load before emitting onError("checkout_load_timeout").
   * Set to 0 to disable. Default 30000.
   */
  loadTimeoutMs?: number;

  /**
   * Extra URL schemes the checkout may hand off to another app, on top of the ones the SDK allows
   * by default.
   *
   * The SDK opens a fixed set — `https`, `tel`, `telprompt`, `sms`, `mailto`, and the
   * BankID/Swish/Vipps/MobilePay payment apps — and refuses everything else with
   * `onError("untrusted_origin")`, so the checkout page cannot use the SDK to launch arbitrary
   * installed apps. Set this if a payment flow in your integration returns to your app through your
   * own custom scheme, which would otherwise be blocked.
   *
   * Give the **scheme only**, without `://` or a path, and note that matching is case-insensitive:
   * `['myshop']`, not `['myshop://return']`. Default `[]`.
   *
   * iOS only — the Android SDK has no equivalent API. On Android the allowlist is fixed to
   * `http`/`https` for popups, with BankID and Swish handled by dedicated hand-offs, and this prop
   * is ignored. Passing it is harmless on both platforms.
   *
   * This widens a security boundary: add only the scheme your own app registers, never a wildcard
   * or a scheme belonging to someone else.
   *
   * @example
   * ```tsx
   * <QliroOneCheckout additionalAllowedUrlSchemes={['myshop']} />
   * ```
   */
  additionalAllowedUrlSchemes?: string[];

  /**
   * Custom style for the component
   */
  style?: StyleProp<ViewStyle>;
  /**
   * A callback for when Qliro One is fully loaded, which is when the interface is loaded and the customer can start interacting with the checkout.
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncheckoutloaded()}
   **/
  onCheckoutLoaded?: () => void;
  /**
   * This callback activates when a customer updates their contact information (email, mobile number, address or personal/organization number).
   * Enables sending abandoned cart emails.
   * @param customer - The updated customer data
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerinfochanged()}
   **/
  onCustomerInfoChanged?: (customer: Customer) => void;
  /**
   * If the customer tries to complete the purchase but the payment is declined because of a negative response on the call to MerchantOrderValidationUrl specified in the order creation, callback will be executed with the DeclineReason as an argument.
   * This is to give the merchant frontend a way to react on the changed state if there is no open socket to their backend.
   * If the merchant wants their frontend to react to a custom error message, a DeclineReasonMessage can be sent from ValidateOrder and will be passed in this function.
   * @param declineReason - The reason
   * @param declineReasonMessage - Custom message sent from ValidateOrder
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentdeclined()}
   **/
  onPaymentDeclined?: (
    declineReason: string,
    declineReasonMessage: string
  ) => void;
  /**
   * Called when the user changes payment method or subtype. Use this for applying payment method based discounts.
   * @param paymentMethod - The updated payment method
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentmethodchanged()}
   **/
  onPaymentMethodChanged?: (paymentMethod: PaymentMethod) => void;
  /**
   * This functionality will be activated if shipping options are provided in the createOrder request and the shipping functionality is used in Qliro One.
   * This callback is called when the customer changes shipping method, secondary option or additional shipping services.
   * @param shipping: The updated shipping data
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingmethodchanged()}
   **/
  onShippingMethodChanged?: (shipping: Shipping) => void;
  /**
   * This functionality will be activated if shipping options are provided in the createOrder request and the shipping functionality is used in Qliro One.
   * When the customer changes shipping option so that the shipping fee is affected, the callback will be executed with the new shipping price and new total price for shipping as arguments.
   * The total price includes amounts for the selected additional shipping services. This way the merchant is able to apply amount-based discounts that take the shipping price into account.
   * @param newShippingPrice - The updated price
   * @param newTotalShippingPrice - The updated total price
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingpricechanged()}
   **/
  onShippingPriceChanged?: (
    newShippingPrice: number,
    newTotalShippingPrice: number
  ) => void;
  /**
   * Called when a payment session has ended
   * When the customer completes the purchase and Qliro One is processing the payment, changing the order in some way might lead to unexpected behavior for the customer.
   * If the merchant wants to unlock their interface or in some other way after reacting to these events, this function can be used.
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()}
   **/
  onPaymentProcessEnd?: () => void;
  /**
   * Called when a payment session has started
   * When the customer completes the purchase and Qliro One is processing the payment, changing the order in some way might lead to unexpected behavior for the customer.
   * If the merchant wants to lock their interface or in some other way react to these events, this function can be used.
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()}
   **/
  onPaymentProcessStart?: () => void;
  /**
   * Called when the checkout session expires — Qliro One sessions are valid for 90 minutes.
   *
   * Setting this handler replaces Qliro One's default behaviour of informing the customer and
   * refreshing the top window, so refreshing becomes your responsibility: fetch a new order HTML
   * snippet for the same order and either update the `orderHtml` prop or call `loadOrderHtml` on the
   * ref. See `docs/session-refresh.md`.
   *
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onsessionexpired()}
   **/
  onSessionExpired?: () => void;
  /**
   * Called when the checkout's content height changes.
   *
   * Only fires while `isScrollEnabled` is false, where the checkout sizes itself to its content.
   * The component applies the height itself, so implementing this is only necessary if the host
   * layout needs to react to it as well.
   *
   * @param height - The new content height, in points
   */
  onCheckoutHeightChanged?: (height: number) => void;
  /**
   * Called when Qliro is about to show the success page after a successful payment.
   * If you set this function you will override the default behaviour of redirecting to your specified success url.
   * @param options - An object with data to be used to customize the redirect to your liking.
   **/
  onCompletePurchaseRedirect?: (options: PurchaseRedirectOptions) => void;
  /**
   * Called after the `addOrderUpdateCallback` action, when Qliro One has synced its orders.
   *
   * May fire several times. Once the order matches your cart, call `removeOrderUpdateCallback` and
   * `unlock` so the customer can interact with the checkout again.
   *
   * @param order - The order as Qliro One currently holds it
   *
   * @see {@link https://developers.qliro.com/docs/qliro-one/checkout-features/update-order}
   **/
  onOrderUpdated?: (order: Order) => void;
  /**
   * This callback activates if a customer clicks the "Not you?" option or chooses to re-authenticate using their personal number during checkout.
   * @see {@link https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerdeauthenticating()}
   **/
  onCustomerDeauthenticating?: () => void;
  /**
   * Called when the checkout requests that a popup/child view be closed.
   */
  onClosePopup?: () => void;
  /**
   * Called when an error occurs in the SDK (load failures, timeouts, parse errors).
   *
   * Use {@link isFatalError} on the code rather than comparing against codes by hand.
   *
   * @param code - A machine-readable error code (see docs/order-lifecycle.md)
   * @param message - A human-readable description
   */
  onError?: (code: QliroOneErrorCode, message: string) => void;
  /**
   * Called when the SDK produces a log message. Verbose 'debug' logs require isDebugEnabled.
   * @param level - The log level
   * @param message - The log message
   */
  onLog?: (level: QliroOneLogLevel, message: string) => void;
  /**
   * Called when the checkout lifecycle state changes (transparent order process).
   * @param state - The new state value
   * @param previousState - The previous state value
   */
  onStateChanged?: (
    state: QliroOneCheckoutState,
    previousState: QliroOneCheckoutState
  ) => void;
  /**
   * Called for lifecycle timing/telemetry events. `durationMs` is present only for the events that
   * measure one — see `docs/order-lifecycle.md` for the event names.
   */
  onTelemetryEvent?: (event: QliroOneTelemetryEvent) => void;
  /**
   * Called (iOS only) when an Apple Pay authorization is requested. The SDK presents the Apple Pay
   * sheet itself; this is an observability hook. Requires the Apple Pay entitlement and a merchant
   * ID — see `docs/apple-pay-react-native.md`.
   *
   * The payload is the request data the checkout supplied, forwarded as-is: its shape is set by the
   * checkout rather than by this SDK, so it is deliberately left untyped. Treat it as diagnostic.
   *
   * @param paymentData - The Apple Pay request data
   */
  onApplePayPaymentRequest?: (paymentData: Record<string, unknown>) => void;
}

export const QliroOneCheckout = forwardRef<
  QliroOneCheckoutRef,
  QliroOneCheckoutProps
>((props, ref) => {
  // Destructured rather than read as `props.x` so the effects below can declare honest dependency
  // arrays (biome's useExhaustiveDependencies cannot see through a member expression), and so
  // `rest` carries exactly the inherited ViewProps onto the wrapper.
  const {
    orderHtml,
    applePayMerchantId,
    isScrollEnabled,
    excludedResultModules,
    isCheckoutScrollEnabled,
    isDebugEnabled,
    loadTimeoutMs = DEFAULT_LOAD_TIMEOUT_MS,
    additionalAllowedUrlSchemes,
    style,
    onCheckoutLoaded,
    onCustomerInfoChanged,
    onPaymentDeclined,
    onPaymentMethodChanged,
    onShippingMethodChanged,
    onShippingPriceChanged,
    onPaymentProcessEnd,
    onPaymentProcessStart,
    onSessionExpired,
    onCheckoutHeightChanged,
    onCompletePurchaseRedirect,
    onOrderUpdated,
    onCustomerDeauthenticating,
    onClosePopup,
    onError,
    onLog,
    onStateChanged,
    onTelemetryEvent,
    onApplePayPaymentRequest,
    ...rest
  } = props;

  const nativeRef = useRef(null);
  const viewRef = useRef<React.ComponentRef<typeof View>>(null);
  const scrollThrottled = useRef(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [checkoutLoaded, setCheckoutLoaded] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | undefined>(
    undefined
  );

  useImperativeHandle(ref, () => ({
    lock: () => {
      if (nativeRef.current) {
        Commands.lock(nativeRef.current);
      }
    },
    unlock: () => {
      if (nativeRef.current) {
        Commands.unlock(nativeRef.current);
      }
    },
    addOrderUpdateCallback: () => {
      if (nativeRef.current) {
        Commands.addOrderUpdateCallback(nativeRef.current);
      }
    },
    removeOrderUpdateCallback: () => {
      if (nativeRef.current) {
        Commands.removeOrderUpdateCallback(nativeRef.current);
      }
    },
    loadOrderHtml: (html: string) => {
      if (nativeRef.current) {
        Commands.loadOrderHtml(nativeRef.current, html);
      }
    },
    enableCheckoutScrolling: (enabled: boolean) => {
      if (nativeRef.current) {
        Commands.enableCheckoutScrolling(nativeRef.current, enabled);
      }
    },
    excludeResultModules: (modules: QliroOneResultModule[]) => {
      if (nativeRef.current) {
        Commands.excludeResultModules(nativeRef.current, modules);
      }
    },
    onScroll: (_event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!scrollThrottled.current && nativeRef.current) {
        const { height } = Dimensions.get('screen');
        viewRef.current?.measure(
          (
            _x: number,
            _y: number,
            _w: number,
            _h: number,
            _pX: number,
            pageY: number
          ) => {
            if (nativeRef.current) {
              Commands.onScrollWithContainerHeight(
                nativeRef.current,
                height,
                pageY
              );
            }
          }
        );

        scrollThrottled.current = true;
        scrollTimeout.current = setTimeout(
          () => (scrollThrottled.current = false),
          250
        );
      }
    },
  }));

  useEffect(() => {
    if (orderHtml && nativeRef.current) {
      Commands.loadOrderHtml(nativeRef.current, orderHtml);
    }
  }, [orderHtml]);

  useEffect(() => {
    if (!checkoutLoaded || !nativeRef.current) {
      return;
    }
    if (typeof isCheckoutScrollEnabled === 'boolean') {
      Commands.enableCheckoutScrolling(
        nativeRef.current,
        isCheckoutScrollEnabled
      );
    }
  }, [checkoutLoaded, isCheckoutScrollEnabled]);

  useEffect(() => {
    if (!checkoutLoaded || !nativeRef.current) {
      return;
    }
    if (excludedResultModules) {
      Commands.excludeResultModules(nativeRef.current, excludedResultModules);
    }
  }, [checkoutLoaded, excludedResultModules]);

  useEffect(() => {
    if (!checkoutLoaded || !nativeRef.current) {
      return;
    }
    if (onSessionExpired) {
      Commands.addSessionExpiredCallback(nativeRef.current);
    } else {
      Commands.removeSessionExpiredCallback(nativeRef.current);
    }
    return () => {
      if (nativeRef.current) {
        Commands.removeSessionExpiredCallback(nativeRef.current);
      }
    };
  }, [checkoutLoaded, onSessionExpired]);

  // Final teardown on unmount: drop the throttle timer. The native callbacks need no unregistering
  // here — addOrderUpdateCallback/addSessionExpiredCallback and their removes are JavaScript
  // evaluated inside the checkout's own web view, which each native view creates and owns, so that
  // state dies with the view. (React also detaches nativeRef before this cleanup runs, so a command
  // dispatched from here would only reach a detached view.)
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return (
    <View
      {...rest}
      ref={viewRef}
      collapsable={false}
      style={[style, contentHeight ? { height: contentHeight } : undefined]}
    >
      <QliroOneCheckoutNativeComponent
        ref={nativeRef}
        style={styles.nativeComponent}
        isScrollEnabled={isScrollEnabled ?? true}
        applePayMerchantId={applePayMerchantId}
        isDebugEnabled={isDebugEnabled}
        loadTimeoutMs={loadTimeoutMs}
        additionalAllowedUrlSchemes={additionalAllowedUrlSchemes}
        onClosePopup={() => {
          onClosePopup?.();
        }}
        onError={(event) => {
          const e = event.nativeEvent;
          if (!e) return;
          // The codegen spec types these as plain strings — Fabric event payloads cannot express a
          // union — so the narrowing to the public types happens here, at the boundary.
          onError?.(e.code as QliroOneErrorCode, e.message);
        }}
        onLog={(event) => {
          const e = event.nativeEvent;
          if (!e) return;
          onLog?.(e.level as QliroOneLogLevel, e.message);
        }}
        onStateChanged={(event) => {
          const e = event.nativeEvent;
          if (!e) return;
          onStateChanged?.(
            e.state as QliroOneCheckoutState,
            e.previousState as QliroOneCheckoutState
          );
        }}
        onTelemetryEvent={(event) => {
          const e = event.nativeEvent;
          if (!e) return;
          let metadata: Record<string, string> | undefined;
          if (e.metadata) {
            try {
              metadata = JSON.parse(e.metadata);
            } catch {
              metadata = undefined;
            }
          }
          onTelemetryEvent?.({
            name: e.name as QliroOneTelemetryEventName,
            durationMs: e.durationMs,
            metadata,
          });
        }}
        onCheckoutLoaded={() => {
          setCheckoutLoaded(true);
          onCheckoutLoaded?.();
        }}
        onCustomerInfoChanged={(event) => {
          const customer = event.nativeEvent?.customer;
          if (!customer) return;
          onCustomerInfoChanged?.(customer);
        }}
        onPaymentDeclined={(event) => {
          const reason = event.nativeEvent?.reason as DeclineReason | undefined;
          if (!reason) return;
          onPaymentDeclined?.(
            reason.declineReason,
            reason.declineReasonMessage
          );
        }}
        onPaymentMethodChanged={(event) => {
          const paymentMethod = event.nativeEvent?.paymentMethod as
            | PaymentMethod
            | undefined;
          if (!paymentMethod) return;
          onPaymentMethodChanged?.(paymentMethod);
        }}
        onShippingMethodChanged={(event) => {
          const shipping = event.nativeEvent?.shipping;
          if (!shipping) return;
          let additionalShippingServices: string[] | undefined;
          if (shipping.additionalShippingServices) {
            try {
              additionalShippingServices = JSON.parse(
                shipping.additionalShippingServices
              );
            } catch {
              additionalShippingServices = undefined;
            }
          }
          onShippingMethodChanged?.({
            ...shipping,
            additionalShippingServices,
          });
        }}
        onShippingPriceChanged={(event) => {
          const shippingPrice = event.nativeEvent?.shippingPrice;
          if (!shippingPrice) return;
          onShippingPriceChanged?.(
            shippingPrice.newShippingPrice,
            shippingPrice.newTotalShippingPrice
          );
        }}
        onPaymentProcessEnd={() => {
          onPaymentProcessEnd?.();
        }}
        onPaymentProcessStart={() => {
          onPaymentProcessStart?.();
        }}
        onSessionExpired={() => {
          onSessionExpired?.();
        }}
        onCheckoutHeightChanged={(event) => {
          setContentHeight(event.nativeEvent.height);
          onCheckoutHeightChanged?.(event.nativeEvent.height);
        }}
        onCompletePurchaseRedirect={(event) => {
          const options = event.nativeEvent?.options;
          if (!options) return;
          onCompletePurchaseRedirect?.(options);
        }}
        onOrderUpdated={(event) => {
          const order = event.nativeEvent?.order;
          if (!order) return;
          let orderItems:
            | Array<{
                merchantReference?: string;
                pricePerItemIncVat?: number;
                quantity?: number;
              }>
            | undefined;
          if (order.orderItems) {
            try {
              orderItems = JSON.parse(order.orderItems);
            } catch {
              orderItems = undefined;
            }
          }
          onOrderUpdated?.({
            ...order,
            orderItems,
          });
        }}
        onCustomerDeauthenticating={() => {
          onCustomerDeauthenticating?.();
        }}
        onApplePayPaymentRequest={(event) => {
          const raw = event.nativeEvent?.paymentData;
          if (!raw) return;
          try {
            onApplePayPaymentRequest?.(JSON.parse(raw));
          } catch {
            // ignore malformed payloads
          }
        }}
      />
    </View>
  );
});

QliroOneCheckout.displayName = 'QliroOneCheckout';

const styles = StyleSheet.create({
  nativeComponent: {
    flex: 1,
  },
});

export default QliroOneCheckout;

export type {
  Customer,
  DeclineReason,
  PaymentMethod,
  PurchaseRedirectOptions,
} from './QliroOneCheckoutNativeComponent.ts';

export { isFatalError } from './types';
export type {
  QliroOneCheckoutRef,
  QliroOneCheckoutState,
  QliroOneError,
  QliroOneErrorCode,
  QliroOneLogLevel,
  QliroOneResultModule,
  QliroOneTelemetryEvent,
  QliroOneTelemetryEventName,
} from './types.ts';

export { useQliroOneCheckout } from './useQliroOneCheckout';
export type {
  UseQliroOneCheckoutOptions,
  UseQliroOneCheckoutResult,
} from './useQliroOneCheckout.ts';

// Public (merchant-facing) models. These intentionally differ from the same-named types in
// QliroOneCheckoutNativeComponent, which are the raw codegen bridge shapes where collection
// fields (`Order.orderItems`, `Shipping.additionalShippingServices`) cross the bridge as JSON
// strings. The component parses those strings before invoking the public callbacks, so consumers
// receive the structured arrays below.
export interface OrderItem {
  merchantReference?: string;
  pricePerItemIncVat?: number;
  quantity?: number;
}

export interface Shipping {
  method?: string;
  secondaryOption?: string;
  additionalShippingServices?: string[];
  price?: number;
  priceExVat?: number;
  totalShippingPrice?: number;
  totalShippingPriceExVat?: number;
  accessCode?: string;
}

export interface Order {
  merchantUpdateVersion?: string;
  totalPrice?: number;
  orderItems?: OrderItem[];
}
