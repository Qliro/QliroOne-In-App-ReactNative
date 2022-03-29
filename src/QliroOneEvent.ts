type QliroEventDataType<T> = { name: T; data: { arguments: any[] } };

/**
 * All Qliro One events can send any number of arguments.
 * Letting arguments in as an array opens up for changes not implemented in the SDK directly.
 */
export type QliroOneEvent =
  | QliroEventDataType<'onCheckoutLoaded'>
  | QliroEventDataType<'onCustomerInfoChanged'>
  | QliroEventDataType<'onCustomerDeauthenticating'>
  | QliroEventDataType<'onPaymentDeclined'>
  | QliroEventDataType<'onPaymentMethodChanged'>
  | QliroEventDataType<'onPaymentProcessStart'>
  | QliroEventDataType<'onPaymentProcessEnd'>
  | QliroEventDataType<'onSessionExpired'>
  | QliroEventDataType<'onShippingMethodChanged'>
  | QliroEventDataType<'onShippingPriceChanged'>
  | QliroEventDataType<'onQliroOneReady'>
  | QliroEventDataType<'onCheckoutLoaded'>
  | QliroEventDataType<'onOrderUpdated'>
  | QliroEventDataType<'onCompletePurchaseRedirect'>
  | { name: 'onClientHeightChange'; data: { height: number } };
