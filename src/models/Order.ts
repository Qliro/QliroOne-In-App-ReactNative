import { OrderItem } from './OrderItem';

export interface Order {
  merchantUpdateVersion?: string;
  totalPrice: number;
  orderItems: OrderItem[];
}
