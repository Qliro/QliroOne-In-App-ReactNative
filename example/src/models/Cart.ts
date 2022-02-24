import { Product } from '.';
import { CartProduct } from './CartProduct';

export interface Cart {
  id: string;
  checkoutId?: number;
  currency?: string;
  discount: number;
  products: CartProduct[];
}

export const addProductToCart = (cart: Cart, product: Product): Cart => {
  const existing = cart.products.find(p => p.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.products.push({ productId: product.id, quantity: 1 });
  }
  return cart;
};

export const removeProductFromCart = (cart: Cart, product: Product): Cart => {
  const index = cart.products.findIndex(p => p.productId === product.id);
  if (index !== undefined && index !== -1) {
    cart.products[index].quantity -= 1;
    if (cart.products[index].quantity === 0) {
      cart.products.splice(index, 1);
    }
  }
  return cart;
};
