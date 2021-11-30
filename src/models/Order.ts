import { OrderItem } from './OrderItem';

export interface Order {
  totalPrice: number;
  orderItems: OrderItem[];
}
