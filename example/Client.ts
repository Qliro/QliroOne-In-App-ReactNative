import { Checkout } from './models';
import { Cart } from './models/Cart';
import { CartProduct } from './models/CartProduct';
import { ProductData } from './models/ProductData';

class Client {
  private get baseUrl(): string {
    return 'https://hats-staging.in.qliro.net/api';
  }

  private get token(): string {
    return 'ZGVtb3VzZXI6RGVtb0BVc2VyQDEyMzQ1';
  }

  private async request<T = any>(url: string, params: any = {}): Promise<T> {
    const fetchParams: RequestInit = {
      method: params.method || 'GET',
      credentials: 'include',
    };
    const headers: any = {
      Authorization: `Basic ${this.token}`,
    };
    if (params.body) {
      headers['Content-Type'] = 'application/json';
      fetchParams.body = JSON.stringify(params.body);
    }
    fetchParams.headers = headers;
    console.log(fetchParams.method, this.baseUrl + url);
    const request = await fetch(this.baseUrl + url, fetchParams);
    console.log('request.status :>> ', request.status);
    if (request.ok) {
      const data = await request.json();
      return data;
    }
    throw `Request $url failed with statusCode ${request.status}`;
  }

  async getProducts(key: String): Promise<ProductData> {
    const response: { data: ProductData } = await this.request(`/skin/${key}`);
    return response.data;
  }

  async getCart(id: String): Promise<Cart> {
    const data: { cart: Cart } = await this.request(`/cart/${id}`);
    return data.cart;
  }

  async createCart(): Promise<Cart> {
    const data: { cart: Cart } = await this.request('/updateCart', {
      method: 'POST',
    });
    return data.cart;
  }

  async updateCart(id: String, cartProducts: CartProduct[]): Promise<Cart> {
    const body = {
      cartId: id,
      products: cartProducts,
    };
    console.log('body :>> ', body);
    const data: { cart: Cart } = await this.request('/updateCart', {
      method: 'POST',
      body,
    });
    console.log('data :>> ', data);
    return data.cart;
  }

  // TODO: What is settings?
  loadCheckout(cartId: String, settings: any): Promise<Checkout> {
    // TODO: What is this?
    settings.availableShippingMethods = true;

    const body = {
      cartId: cartId,
      skin: 'store',
      forceNewOrder: false,
      settings: settings,
    };

    return this.request('/loadCheckout', { method: 'POST', body });
  }
}

class MockClient extends Client {
  private cart: Cart = {
    id: '604a328979b2e2099407b291',
    checkoutId: 3157831,
    currency: 'SEK',
    discount: 0,
    products: [],
  };

  async getProducts(): Promise<ProductData> {
    console.log('getProducts');
    return require('./mock/hats.json').data;
  }

  async getCart(id: string): Promise<Cart> {
    console.log('getCart', id);
    return this.cart;
  }

  async createCart(): Promise<Cart> {
    console.log('createCart');
    return this.cart;
  }

  async updateCart(_: String, products: CartProduct[]): Promise<Cart> {
    console.log('updateCart');
    return { ...this.cart, products };
  }

  async loadCheckout(): Promise<Checkout> {
    console.log('loadCheckout');
    const orderId = this.cart.checkoutId!;
    return {
      cart: this.cart,
      qliroResponse: {
        orderHtmlSnippet: `<script type=\"text/javascript\">(function(w, g) { w[g] = {\r\ncheckoutWebAppBaseUrl: \"https://pago.qit.nu/checkout/webapp/\",\r\ncheckoutWebAppVersion: \"1.74.0\",\r\ncheckoutWebApiBaseUrl: \"https://pago.qit.nu/checkout/webapi/\",\r\nqliroTermsUrl: \"https://assets.qliro.com/terms/se/sv/terms/1/user_terms.pdf\",\r\norderId: \"${orderId}\",\r\ncountry: \"SE\",\r\nlanguage: \"sv-se\",\r\nauth: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNZXJjaGFudElkIjoiOSIsIk9yZGVySWQiOiIzMTU3NjY1IiwiQ291bnRyeUNvZGUiOiJTRSIsIkN1cnJlbmN5Q29kZSI6IlNFSyIsIkxhbmd1YWdlQ29kZSI6InN2LXNlIiwibmJmIjoxNjM4MjEyMjkyLCJleHAiOjE2MzgyMTc2OTIsImlhdCI6MTYzODIxMjI5MiwiaXNzIjoiUU8ifQ.z7WVSZ0m1F6ZGHOB-vg6iMOuMHr8p0U1k3eSEgR5yak\",\r\nmerchantConfirmationUrl: \"https://hats-staging.in.qliro.net/hats/thankyou\",\r\nmerchantTermsUrl: \"https://hats-staging.in.qliro.net/terms\",\r\nmerchantIntegrityPolicyUrl: \"\",\r\nqliroIntegrityPolicyUrl: \"https://assets.qliro.com/terms/se/sv/terms/1/integrity_policy.pdf\",\r\nqliroInvoiceTermsUrl: \"https://assets.qliro.com/terms/se/sv/terms/1/terms_invoice.pdf\",\r\nmerchantGoogleTagManagerId: \"hats-staging\",\r\ngoogleApiKey: \"AIzaSyAkW8LC2HF0pKCph1DxCZpMtkLv5FDnI1Y\",\r\norderPollSetting: [],\r\npaymentStatusPollSetting: [],\r\nstyling: {\r\nprimaryColor: \"#78D5BB\",\r\ncallToActionColor: \"#78D5BB\",\r\nbackgroundColor: \"#FFFFFF\",\r\n},\r\npersonalNumberFormat: {\r\ncanBePresentedWithBirthdayAndLastXCharacters: true,\r\n},\r\npaymentMethodConfig: {\r\ntrustly: {\"visibleBanks\":[\"SWEDBANK\",\"HANDELSBANKEN\",\"NORDEA\",\"SEB\"]},\r\n},\r\ntrackingConfig: {\r\nenableGoogleAnalytics: true,\r\nenableGoogleOptimize: true,\r\nenableNewRelic: true,\r\nenableHotjar: false,\r\n},\r\naddressConfig: {\r\nshowArea: false,\r\nshowStreet2ForPhysical: false,\r\n},\r\n}\r\n})\r\n(window, 'qcoGlobal');</script><div id=\"qliro-root\"></div><script src=\"https://pago.qit.nu/checkout/webapp/bootstrap.js?v=1.74.0_H17l0ZnPzO+4TgMREzg=XX\" async></script>`,
        orderId,
        merchantReference: 'HATS-5b50-322a-0506-d36a',
        totalPrice: 0,
        currency: 'SEK',
        country: 'SE',
        language: 'sv-se',
        customerCheckoutStatus: 'InProcess',
        orderItems: [],
        identityVerification: {
          requireIdentityVerification: true,
        },
        merchantProvidedMetadata: [],
      },
    };
  }
}

export const client: Client = new Client();
