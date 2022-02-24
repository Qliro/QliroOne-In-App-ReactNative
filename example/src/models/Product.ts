import { Image } from './Image';

export interface Product {
  id: string;
  price: number;
  merchantReference: string;
  brand: string;
  name: string;
  outOfStock: boolean;
  hasRisk: boolean;
  requireIdentityVerification: boolean;
  type: string;
  image: Image;
}
