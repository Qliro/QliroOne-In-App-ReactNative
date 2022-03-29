import { Order, PurchaseRedirectOptions } from './models';

export interface QliroOneProps {
  /**
   * orderHtmlSnippet returned from the order response used to load the checkout.
   */
  orderHtml: string | undefined;

  /**
   * Called after the updateOrders action has been called when Qliro One has synced its orders.
   * This might be called multiple times and should return true when
   * the Qliro One and the app is in sync. Returning true will unlock the Checkout.
   * @param order - The order
   * @param rest - Possible extra arguments not yet supported by SDK types. [Read more]{@link https://developers.qliro.com/docs/qliro-one/checkout-features/update-order}
   * @returns {boolean} - true if the order is successfully synced otherwise false
   **/
  onOrderUpdated: (order: Order, ...rest: any[]) => boolean;

  /**
   * Called when Qliro is about to show the success page after a successful payment.
   * If you set this function you will override the default behaviour of redirecting to your specified success url.
   * @param options - An object with data to be used to customize the redirect to your liking.
   **/
  onCompletePurchaseRedirect?: (options: PurchaseRedirectOptions) => void;

  /**
   * Sets to enable scroll, otherwise the height will be as tall as required.
   */
  scrollEnabled?: boolean;

  /**
   * Called when something is logged
   * @param message - The message to be logged
   */
  onLogged?: (message: string) => void;
}
