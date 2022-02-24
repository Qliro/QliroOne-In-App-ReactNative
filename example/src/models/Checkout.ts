import { Cart } from '.';
import { QliroResponse } from 'qliroone_reactnative';

export interface Checkout {
  cart: Cart;
  qliroResponse?: QliroResponse;
}
