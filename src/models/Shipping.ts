export interface Shipping {
  method: string;
  secondaryOption: string;
  additionalShippingServices: string[];
  price: number;
  priceExVat: number;
  totalShippingPrice: number;
  totalShippnigPriceExVat: number;
}
