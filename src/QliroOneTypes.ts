import { Component } from "react";
import { Constructor, NativeMethods, ViewProps } from "react-native";
import { QliroOneNativeEvent } from "./QliroOneEvent";
import * as Models from "./models";

export type QliroOneCheckoutNativeProps = {
  onCheckoutLoaded: () => void;
  onOrderUpdated: (event: QliroOneNativeEvent<Models.Order, "order">) => void;
  onCustomerInfoChanged: (
    event: QliroOneNativeEvent<Models.Customer, "customer">
  ) => void;
  onCustomerDeauthenticating: () => void;
  onPaymentMethodChanged: (
    event: QliroOneNativeEvent<Models.PaymentMethod, "paymentMethod">
  ) => void;
  onPaymentDeclined: (
    event: QliroOneNativeEvent<
      { declineReason: string; declineReasonMessage: string },
      "reason"
    >
  ) => void;
  onPaymentProcessStart: () => void;
  onPaymentProcessEnd: () => void;
  onSessionExpired: () => void;
  onShippingMethodChanged: (
    event: QliroOneNativeEvent<Models.Shipping, "shipping">
  ) => void;
  onShippingPriceChanged: (
    event: QliroOneNativeEvent<
      { newShippingPrice: number; newTotalShippingPrice: number },
      "shippingPrice"
    >
  ) => void;
  onCompletePurchaseRedirect: (
    event: QliroOneNativeEvent<Models.PurchaseRedirectOptions, "options">
  ) => void;
};

declare class NativeCheckoutComponent extends Component<
  QliroOneCheckoutNativeProps & ViewProps
> {}
declare const NativeCheckoutBase: Constructor<NativeMethods> &
  typeof NativeCheckoutComponent;
export class NativeCheckout extends NativeCheckoutBase {}
