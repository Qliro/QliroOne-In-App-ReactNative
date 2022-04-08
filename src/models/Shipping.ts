export interface Shipping {
  method: string;
  secondaryOption: string | null;
  additionalShippingServices: string[] | null;
  price: number;
  priceExVat: number;
  totalShippingPrice: number;
  totalShippnigPriceExVat: number;
}
