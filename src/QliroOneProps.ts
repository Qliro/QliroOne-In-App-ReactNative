import { Order } from './models';

export interface QliroOneProps {
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
   * Return true to stop Qliro from showing the success page and let the receiver handle it.
   * @returns {boolean} - false if Qliro One should show the default success page, otherwise false
   **/
  onWillShowSuccess: () => boolean;
}
