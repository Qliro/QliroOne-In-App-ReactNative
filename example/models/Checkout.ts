import { Cart } from '.';
import { QliroResponse } from '../../src/models';

export interface Checkout {
  cart: Cart;
  qliroResponse?: QliroResponse;
}
