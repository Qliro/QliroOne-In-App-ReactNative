import { Order } from './models';

export interface QliroOneProps {
  /**
   * orderHtmlSnippet returned from the order response used to load the checkout.
   */
  orderHtml: string | undefined;

  /**
   * Called when Qliro One has synced its orders.
   * This might be called multiple times and should return true when
   * the Qliro One and the app is in sync. Returning true will unlock the Checkout.
   * @param order - The order
   * @returns {boolean} - true if the order is successfully synced otherwise false
   **/
  onOrderUpdated: (order: Order) => boolean;

  /**
   * Called when Qliro is about to show the success page after a successful payment.
   **/
  onCompletePurchaseRedirect?: () => void;

  /**
   * set to true if Qliro One should show the default success page
   * if false you can handle this yourself with a callback @see onWillShowSuccess
   * defaults to true.
   **/
  redirectToSuccess?: boolean;

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
