export interface QliroResponse {
  orderId: number;
  orderHtmlSnippet: string;
  customerCheckoutStatus: string;
  totalPrice: number;
  currency: string;
  merchantReference: string;
  country: string;
  language: string;
  orderItems: [];
  identityVerification: {
    requireIdentityVerification: boolean;
  };
  merchantProvidedMetadata: [];
}
