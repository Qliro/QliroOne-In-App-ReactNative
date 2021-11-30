import { Customer, Order, PaymentMethod, Shipping } from './models';

export type QliroOneEvent =
  | { name: 'onCheckoutLoaded' }
  | { name: 'onCustomerInfoChanged'; data: Customer }
  | { name: 'onCustomerDeauthenticating' }
  | { name: 'onPaymentDeclined'; data: string }
  | { name: 'onPaymentMethodChanged'; data: PaymentMethod }
  | { name: 'onPaymentProcessStart' }
  | { name: 'onPaymentProcessEnd' }
  | { name: 'onSessionExpired' }
  | { name: 'onShippingMethodChanged'; data: Shipping }
  | { name: 'onShippingPriceChanged'; data: number }
  | { name: 'onClientHeightChange'; data: number }
  | { name: 'onQliroOneReady' }
  | { name: 'onCheckoutLoaded' }
  | { name: 'onOrderUpdated'; data: Order };
