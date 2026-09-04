import type React from 'react';
import type { HostComponent, ViewProps } from 'react-native';
import { codegenNativeCommands, codegenNativeComponent } from 'react-native';
import type {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypesNamespace';

export interface Customer {
  email?: string;
  mobileNumber?: string;
  personalNumber?: string;
  organizationNumber?: string;
  address?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    careOf?: string;
    city?: string;
    postalCode?: string;
    isMasked?: boolean;
  };
}

export interface PaymentMethod {
  method?: string;
  subtype?: string;
  price?: Double;
  priceExVat?: Double;
}

export interface Shipping {
  method?: string;
  secondaryOption?: string;
  additionalShippingServices?: string;
  price?: Double;
  priceExVat?: Double;
  totalShippingPrice?: Double;
  totalShippingPriceExVat?: Double;
  accessCode?: string;
}

export interface ShippingPrice {
  newShippingPrice: Double;
  newTotalShippingPrice: Double;
}

export interface DeclineReason {
  declineReason: string;
  declineReasonMessage: string;
}

export interface PurchaseRedirectOptions {
  merchantConfirmationUrl?: string;
}

export interface OrderItem {
  merchantReference?: string;
  pricePerItemIncVat?: Double;
  quantity?: Double;
}

export interface Order {
  merchantUpdateVersion?: string;
  totalPrice?: Double;
  orderItems?: string;
}

export interface NativeProps extends ViewProps {
  isScrollEnabled?: boolean;
  applePayMerchantId?: string;
  isDebugEnabled?: boolean;
  loadTimeoutMs?: Double;
  // iOS only; the Android SDK has no equivalent API (its scheme allowlist is a private `val` in
  // WebViewSecurity.kt). Declared unconditionally rather than as a `ios_` prefixed prop because the
  // Android bridge simply ignores unknown props, and a platform-suffixed name would leak into the
  // public TypeScript API. `ReadonlyArray<string>` maps to `std::vector<std::string>` in the
  // generated Fabric props.
  additionalAllowedUrlSchemes?: ReadonlyArray<string>;
  onCheckoutLoaded?: DirectEventHandler<{}>;
  onCustomerInfoChanged?: DirectEventHandler<{
    customer: {
      email?: string;
      mobileNumber?: string;
      personalNumber?: string;
      organizationNumber?: string;
      address?: {
        firstName?: string;
        lastName?: string;
        street?: string;
        careOf?: string;
        city?: string;
        postalCode?: string;
        isMasked?: boolean;
      };
    };
  }>;
  onPaymentDeclined?: DirectEventHandler<{
    reason: {
      declineReason: string;
      declineReasonMessage: string;
    };
  }>;
  onPaymentMethodChanged?: DirectEventHandler<{
    paymentMethod: {
      method?: string;
      subtype?: string;
      price?: Double;
      priceExVat?: Double;
    };
  }>;
  onShippingMethodChanged?: DirectEventHandler<{
    shipping: {
      method?: string;
      secondaryOption?: string;
      additionalShippingServices?: string;
      price?: Double;
      priceExVat?: Double;
      totalShippingPrice?: Double;
      totalShippingPriceExVat?: Double;
      accessCode?: string;
    };
  }>;
  onShippingPriceChanged?: DirectEventHandler<{
    shippingPrice: {
      newShippingPrice: Double;
      newTotalShippingPrice: Double;
    };
  }>;
  onPaymentProcessEnd?: DirectEventHandler<{}>;
  onPaymentProcessStart?: DirectEventHandler<{}>;
  onSessionExpired?: DirectEventHandler<{}>;
  onCheckoutHeightChanged?: DirectEventHandler<{ height: Double }>;
  onCompletePurchaseRedirect?: DirectEventHandler<{
    options: {
      merchantConfirmationUrl?: string;
    };
  }>;
  onOrderUpdated?: DirectEventHandler<{
    order: {
      merchantUpdateVersion?: string;
      totalPrice?: Double;
      orderItems?: string;
    };
  }>;
  onCustomerDeauthenticating?: DirectEventHandler<{}>;
  onClosePopup?: DirectEventHandler<{}>;
  onError?: DirectEventHandler<{ code: string; message: string }>;
  onLog?: DirectEventHandler<{ level: string; message: string }>;
  onStateChanged?: DirectEventHandler<{ state: string; previousState: string }>;
  // metadata is a JSON-encoded string (codegen events cannot express arbitrary maps).
  onTelemetryEvent?: DirectEventHandler<{
    name: string;
    durationMs?: Double;
    metadata?: string;
  }>;
  // Fired (iOS only) when an Apple Pay authorization is requested. paymentData is a JSON string.
  onApplePayPaymentRequest?: DirectEventHandler<{ paymentData: string }>;
}

// `React.ElementRef` is deprecated in the React 19 types, and `React.ComponentRef` is its
// replacement everywhere else in this package. It must NOT be modernized here.
//
// Codegen parses this file as text, not as types: RN 0.81.1's command parser hardcodes a check for
// `typeName.right.name === 'ElementRef'` and throws
// "The first argument of method <name> must be of type React.ElementRef<>" for anything else
// (node_modules/@react-native/codegen/lib/parsers/typescript/components/commands.js). The failure
// surfaces as a `pod install` abort in the consuming app — the example, qliro-one-hats, and the
// build-ios CI job — and `tsc`, biome, jest and bob all pass regardless, so no JS-side gate catches
// it. Since peerDependencies allow react-native >=0.76, the annotation has to satisfy the oldest
// supported codegen, not the newest.
export interface NativeCommands {
  loadOrderHtml: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    html: string
  ) => void;
  lock: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  unlock: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  addSessionExpiredCallback: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;
  removeSessionExpiredCallback: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;
  addOrderUpdateCallback: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;
  removeOrderUpdateCallback: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>
  ) => void;
  enableCheckoutScrolling: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    enabled: boolean
  ) => void;
  excludeResultModules: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    modules: string[]
  ) => void;
  onScrollWithContainerHeight: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    containerHeight: Double,
    offset: Double
  ) => void;
}

export default codegenNativeComponent<NativeProps>(
  'QliroOneCheckout'
) as HostComponent<NativeProps>;

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'loadOrderHtml',
    'lock',
    'unlock',
    'addSessionExpiredCallback',
    'removeSessionExpiredCallback',
    'addOrderUpdateCallback',
    'removeOrderUpdateCallback',
    'enableCheckoutScrolling',
    'excludeResultModules',
    'onScrollWithContainerHeight',
  ],
});
