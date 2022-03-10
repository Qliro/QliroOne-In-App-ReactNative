import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Module } from './models/Module';

export interface QliroOneActions {
  /**
   * Lock the Qliro One frontend and disable user interaction.
   */
  lock: () => void;

  /**
   * Unlock the Qliro One frontend and enable user interaction.
   */
  unlock: () => void;

  /**
   * Initiates the order sync process. The frontend application is locked and user interaction is disabled until
   * the return value of the provided callback function isUpdated is truthy.
   */
  updateOrders: () => void;

  /**
   * When enabled, Qliro One will scroll to the selected payment or shipping option after a customer have chosen one in the expanded list. (default: false)
   * @param enabled - Whether to enable scrolling
   */
  enableScrolling: (enabled: boolean) => void;

  /**
   * Used to exclude optional modules from displaying on the result page (thank you page).
   * @param modules - An array of modules to exclude
   */
  excludeResultModules: (modules: Module[]) => void;

  /**
   * If the component is rendered inside a scrollview this function should be called on when scrolling in the view to ensure the popups get postioned correctly
   */
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}
