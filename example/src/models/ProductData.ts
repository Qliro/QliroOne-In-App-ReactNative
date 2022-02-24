import { Settings } from '.';
import { Product } from './Product';

export interface ProductData {
  products: Product[];
  settings: Settings['settings'];
}
