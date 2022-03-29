import { Customer, PaymentMethod, Shipping } from './models';

export interface QliroOneListener {
  /**
   * A callback for when Qliro One is fully loaded, which is when the interface is loaded and the customer can start interacting with the checkout.
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncheckoutloaded()>}
   **/
  onCheckoutLoaded: (...rest: any[]) => void;

  /**
   * This callback activates when a customer updates their contact information (email, mobile number, address or personal/organization number).
   * Enables sending abandoned cart emails.
   * @param customer - The updated customer data
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerinfochanged()>}
   **/
  onCustomerInfoChanged: (customer: Customer, ...rest: any[]) => void;

  /**
   * This callback activates if a customer clicks the "Not you?" option or chooses to re-authenticate using their personal number during checkout.
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#oncustomerdeauthenticating()>}
   **/
  onCustomerDeauthenticating: (...rest: any[]) => void;

  /**
   * Called when the the user changes payment method or subtype. Use this for applying payment method based discounts.
   * @param paymentMethod - The updated payment method
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentmethodchanged()>}
   **/
  onPaymentMethodChanged: (
    paymentMethod: PaymentMethod,
    ...rest: any[]
  ) => void;

  /**
   * If the customer tries to complete the purchase but the payment is declined because of a negative response on the call to MerchantOrderValidationUrl specified in the order creation, callback will be executed with the DeclineReason as an argument.
   * This is to give the merchant frontend a way to react on the changed state if there is no open socket to their backend.
   * If the merchant wants their frontend to react to a custom error message, a DeclineReasonMessage can be sent from ValidateOrder and will be passed in this function.
   * @param declineReason - The reason
   * @param declineReasonMessage - Custom message sent from ValidateOrder
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentdeclined()>}
   **/
  onPaymentDeclined: (
    declineReason: string,
    declineReasonMessage: string,
    ...rest: any[]
  ) => void;

  /**
   * Called when when a payment session has started
   * When the customer completes the purchase and Qliro One is processing the payment, changing the order in some way might lead to unexpected behavior for the customer.
   * If the merchant wants to lock their interface or in some other way react to these events, this function can be used.
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>}
   **/
  onPaymentProcessStart: (...rest: any[]) => void;

  /**
   * Called when when a payment session has ended
   * When the customer completes the purchase and Qliro One is processing the payment, changing the order in some way might lead to unexpected behavior for the customer.
   * If the merchant wants to unlock their interface or in some other way after reacting to these events, this function can be used.
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onpaymentprocess()>}
   **/
  onPaymentProcessEnd: (...rest: any[]) => void;

  /**
   * If the authorization token expires during a session, the customer will be informed inside Qliro One.
   * When the customer closes the dialog, the top window will be refreshed.
   * Using onSessionExpired is optional and overrides this behavior, replacing it with the execution of updateToken.
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onsessionexpired()>}
   **/
  onSessionExpired: (...rest: any[]) => void;

  /**
   * This functionality will be activated if shipping options are provided in the createOrder request and the shipping functionality is used in Qliro One.
   * This callback is called when the customer changes shipping method, secondary option or additional shipping services.
   * @param shipping: The updated shipping data
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingmethodchanged()>}
   **/
  onShippingMethodChanged: (shipping: Shipping, ...rest: any[]) => void;

  /**
   * This functionality will be activated if shipping options are provided in the createOrder request and the shipping functionality is used in Qliro One.
   * When the customer changes shipping option so that the shipping fee is affected, the callback will be executed with the new shipping price and new total price for shipping as arguments.
   * The total price includes amounts for the selected additional shipping services. This way the merchant is able to apply amount-based discounts that take the shipping price into account.
   * @param newShippingPrice - The updated price
   * @param newTotalShippingPrice - The updated total price
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link <https://developers.qliro.com/docs/qliro-one/frontend-features/listeners#onshippingpricechanged()>}
   **/
  onShippingPriceChanged: (
    newShippingPrice: number,
    newTotalShippingPrice: number,
    ...rest: any[]
  ) => void;
}
