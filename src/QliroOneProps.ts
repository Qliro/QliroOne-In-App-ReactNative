import { Module } from "./models";

export interface QliroOneProps {
  /**
   * orderHtmlSnippet returned from the order response used to load the checkout.
   */
  orderHtml: string | undefined;

  /**
   * Set to true to enable scroll, otherwise the checkout will size itself after its content.
   * This should not be set to true if you are nesting the checkout inside of another scrollview.
   */
  isScrollEnabled?: boolean;

  /**
   * Used to exclude optional modules from displaying on the result page (thank you page).
   */
  excludedResultModules?: Module[];

  /**
   * When enabled, Qliro One will scroll to the selected payment or shipping option after a customer have chosen one in the expanded list. (default: false)
   * This have no effect when isScrollEnabled is true.
   */
  isCheckoutScrollEnabled?: boolean;

  /**
   * Called when something is logged
   * @param message - The message to be logged
   */
  onLogged?: (message: string) => void;
}
